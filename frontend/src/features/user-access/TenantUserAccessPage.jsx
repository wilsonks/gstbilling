import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Edit, Plus, Power, RefreshCw, ShieldCheck } from "lucide-react";
import TenantUserAccessFormModal from "./TenantUserAccessFormModal";
import {
  deactivateTenantUserAccess,
  getMyTenantUserAccess,
  getTenantUserAccessStats,
  reactivateTenantUserAccess,
} from "./tenantUserAccessApi";
import { getMyTenantUsers } from "../user/tenantUserApi";
import { getMyCompanies } from "../company/companyApi";

function MetricCard({ label, value, helpText, loading = false }) {
  return (
    <Card
      borderWidth="1px"
      borderColor="gray.200"
      shadow="sm"
      borderRadius="xl"
    >
      <CardBody>
        <Stat>
          <StatLabel color="gray.500">{label}</StatLabel>
          <StatNumber fontSize="2xl">
            {loading ? <Skeleton height="30px" width="100px" /> : value}
          </StatNumber>
          <StatHelpText mb="0">
            {loading ? <Skeleton height="16px" width="160px" /> : helpText}
          </StatHelpText>
        </Stat>
      </CardBody>
    </Card>
  );
}

export default function TenantUserAccessPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [accessRows, setAccessRows] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recentAccess: [],
  });
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [selectedAccess, setSelectedAccess] = useState(null);

  const loadPageData = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [accessData, statsData, userData, companyData] = await Promise.all([
        getMyTenantUserAccess(),
        getTenantUserAccessStats(),
        getMyTenantUsers(),
        getMyCompanies(),
      ]);

      setAccessRows(accessData || []);
      setStats(
        statsData || {
          total: 0,
          active: 0,
          inactive: 0,
          recentAccess: [],
        },
      );
      setUsers(userData || []);
      setCompanies(companyData || []);
    } catch (error) {
      toast({
        title: "Failed to load user access",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const roleOptions = useMemo(() => {
    return [
      ...new Set(accessRows.map((row) => row.role).filter(Boolean)),
    ].sort();
  }, [accessRows]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return accessRows.filter((row) => {
      const matchesQuery =
        !q ||
        String(row.username || "")
          .toLowerCase()
          .includes(q) ||
        String(row.userEmail || "")
          .toLowerCase()
          .includes(q) ||
        String(row.companyName || "")
          .toLowerCase()
          .includes(q) ||
        String(row.companyGstin || "")
          .toLowerCase()
          .includes(q);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "ACTIVE" && row.active) ||
        (statusFilter === "INACTIVE" && !row.active);

      const matchesRole = !roleFilter || String(row.role || "") === roleFilter;

      return matchesQuery && matchesStatus && matchesRole;
    });
  }, [accessRows, query, statusFilter, roleFilter]);

  const handleCreate = () => {
    setSelectedAccess(null);
    onOpen();
  };

  const handleEdit = (record) => {
    setSelectedAccess(record);
    onOpen();
  };

  const handleModalClose = () => {
    setSelectedAccess(null);
    onClose();
  };

  const handleToggleStatus = async (record) => {
    try {
      if (record.active) {
        await deactivateTenantUserAccess(record.id);
      } else {
        await reactivateTenantUserAccess(record.id);
      }

      toast({
        title: record.active
          ? "User access deactivated"
          : "User access reactivated",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      await loadPageData({ silent: true });
    } catch (error) {
      toast({
        title: "Failed to update user access status",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Stack spacing={6}>
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Box>
          <Heading size="lg">User Access</Heading>
          <Text color="gray.500" mt={1}>
            Assign tenant users to companies and manage company-level access
            roles.
          </Text>
        </Box>

        <HStack spacing={3}>
          <Button
            leftIcon={<RefreshCw size={16} />}
            variant="outline"
            onClick={() => loadPageData({ silent: true })}
            isLoading={refreshing}
          >
            Refresh
          </Button>

          <Button
            leftIcon={<Plus size={16} />}
            colorScheme="blue"
            onClick={handleCreate}
          >
            New Access
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <MetricCard
          label="Total Access Records"
          value={stats.total}
          helpText="All user-company assignments"
          loading={loading}
        />
        <MetricCard
          label="Active Access"
          value={stats.active}
          helpText="Currently usable assignments"
          loading={loading}
        />
        <MetricCard
          label="Inactive Access"
          value={stats.inactive}
          helpText="Disabled user-company mappings"
          loading={loading}
        />
      </SimpleGrid>

      <Card
        borderWidth="1px"
        borderColor="gray.200"
        shadow="sm"
        borderRadius="xl"
      >
        <CardBody>
          <Stack spacing={4}>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={3}>
              <Input
                placeholder="Search by user, email, company, or GSTIN"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>

              <Select
                placeholder="Filter by role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
            </SimpleGrid>

            <Box overflowX="auto">
              {loading ? (
                <Stack spacing={3}>
                  <Skeleton height="56px" />
                  <Skeleton height="56px" />
                  <Skeleton height="56px" />
                  <Skeleton height="56px" />
                </Stack>
              ) : filteredRows.length === 0 ? (
                <Box py={10} textAlign="center">
                  <ShieldCheck size={28} style={{ margin: "0 auto" }} />
                  <Text fontWeight="600" mt={3}>
                    No user access records found
                  </Text>
                  <Text color="gray.500" mt={1}>
                    Create a user-company access mapping or adjust your filters.
                  </Text>
                </Box>
              ) : (
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th>User</Th>
                      <Th>Company</Th>
                      <Th>Role</Th>
                      <Th>Status</Th>
                      <Th>Updated By</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredRows.map((row) => (
                      <Tr key={row.id}>
                        <Td>
                          <Stack spacing={0}>
                            <Text fontWeight="700">{row.username || "—"}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {row.userEmail || "—"}
                            </Text>
                          </Stack>
                        </Td>

                        <Td>
                          <Stack spacing={0}>
                            <Text fontWeight="600">
                              {row.companyName || "—"}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {row.companyGstin || "—"}
                            </Text>
                          </Stack>
                        </Td>

                        <Td>
                          <Badge colorScheme="blue">{row.role || "—"}</Badge>
                        </Td>

                        <Td>
                          <Badge colorScheme={row.active ? "green" : "gray"}>
                            {row.active ? "ACTIVE" : "INACTIVE"}
                          </Badge>
                        </Td>

                        <Td>{row.updatedBy || "—"}</Td>

                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              size="sm"
                              variant="outline"
                              icon={<Edit size={16} />}
                              aria-label="Edit user access"
                              onClick={() => handleEdit(row)}
                            />
                            <IconButton
                              size="sm"
                              variant="outline"
                              colorScheme={row.active ? "red" : "green"}
                              icon={<Power size={16} />}
                              aria-label={
                                row.active
                                  ? "Deactivate user access"
                                  : "Reactivate user access"
                              }
                              onClick={() => handleToggleStatus(row)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>
          </Stack>
        </CardBody>
      </Card>

      <TenantUserAccessFormModal
        isOpen={isOpen}
        onClose={handleModalClose}
        onSuccess={() => loadPageData({ silent: true })}
        accessRecord={selectedAccess}
        users={users}
        companies={companies}
      />
    </Stack>
  );
}
