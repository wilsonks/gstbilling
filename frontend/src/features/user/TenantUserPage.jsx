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
import {
  Edit,
  Plus,
  Power,
  RefreshCw,
  UserCog,
  Download,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import TenantUserFormModal from "./TenantUserFormModal";
import BulkImportModal from "../../components/import/BulkImportModal";

import {
  deactivateTenantUser,
  getMyTenantUsers,
  getTenantUserStats,
  reactivateTenantUser,
  downloadUserTemplate,
  exportUsersExcel,
  validateUserImport,
  commitUserImport,
  downloadUserImportErrors,
  resetUserPassword,
} from "./tenantUserApi";

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

const userPreviewColumns = [
  {
    label: "Username",
    dtoField: "username",
    rawField: "USERNAME",
  },

  {
    label: "Email",
    dtoField: "email",
    rawField: "EMAIL",
  },

  {
    label: "Roles",
    dtoField: "roles",
    rawField: "ROLES",
  },

  {
    label: "Active",
    dtoField: "active",
    rawField: "ACTIVE",
  },
];

const customerValidationColumns = [
  {
    key: "rowNumber",
    label: "Row",
  },
  {
    key: "column",
    label: "Column",
  },
  {
    key: "value",
    label: "Value",
  },
  {
    key: "message",
    label: "Error",
  },
];

const summaryCards = [
  {
    label: "Total Rows",
    field: "totalRows",
    color: undefined,
  },
  {
    label: "Valid Rows",
    field: "validRows",
    color: "green.500",
  },
  {
    label: "Invalid Rows",
    field: "invalidRows",
    color: "red.500",
  },
];

export default function TenantUserPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isImportOpen,
    onOpen: onImportOpen,
    onClose: onImportClose,
  } = useDisclosure();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recentUsers: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  const handleResetPassword = async (user) => {
    const confirmed = window.confirm(`Reset password for ${user.username}?`);

    if (!confirmed) {
      return;
    }

    try {
      await resetUserPassword(user.id);

      toast({
        title: "Password reset",
        description: `Temporary password: Temp@12345`,
        status: "success",
      });

      loadPageData({
        silent: true,
      });
    } catch (error) {
      toast({
        title: "Reset failed",
        description:
          error?.response?.data?.message || "Unable to reset password",
        status: "error",
      });
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = async () => {
    const blob = await downloadUserTemplate();

    downloadBlob(blob, "user-template.xlsx");
  };

  const handleExport = async () => {
    const blob = await exportUsersExcel();

    downloadBlob(blob, "users.xlsx");
  };

  const loadPageData = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [usersData, statsData] = await Promise.all([
        getMyTenantUsers(),
        getTenantUserStats(),
      ]);

      setUsers(usersData || []);
      setStats(
        statsData || {
          total: 0,
          active: 0,
          inactive: 0,
          recentUsers: [],
        },
      );
    } catch (error) {
      toast({
        title: "Failed to load users",
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
      ...new Set(users.flatMap((user) => user.roles || []).filter(Boolean)),
    ].sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        !q ||
        String(user.username || "")
          .toLowerCase()
          .includes(q) ||
        String(user.email || "")
          .toLowerCase()
          .includes(q);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "ACTIVE" && user.active) ||
        (statusFilter === "INACTIVE" && !user.active);

      const matchesRole =
        !roleFilter || (user.roles || []).includes(roleFilter);

      return matchesQuery && matchesStatus && matchesRole;
    });
  }, [users, query, statusFilter, roleFilter]);

  const handleCreate = () => {
    setSelectedUser(null);
    onOpen();
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleModalClose = () => {
    setSelectedUser(null);
    onClose();
  };

  const handleToggleStatus = async (user) => {
    try {
      if (user.active) {
        await deactivateTenantUser(user.id);
      } else {
        await reactivateTenantUser(user.id);
      }

      toast({
        title: user.active ? "User deactivated" : "User reactivated",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      await loadPageData({ silent: true });
    } catch (error) {
      toast({
        title: "Failed to update user status",
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
          <Heading size="lg">Users</Heading>
          <Text color="gray.500" mt={1}>
            Manage tenant users, roles, and activation status.
          </Text>
        </Box>

        <HStack spacing={3}>
          <Button
            leftIcon={<FileSpreadsheet size={16} />}
            variant="outline"
            onClick={handleDownloadTemplate}
          >
            Template
          </Button>

          <Button
            leftIcon={<Download size={16} />}
            variant="outline"
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            leftIcon={<Upload size={16} />}
            variant="outline"
            colorScheme="blue"
            onClick={onImportOpen}
          >
            Bulk Import
          </Button>

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
            New User
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <MetricCard
          label="Total Users"
          value={stats.total}
          helpText="All tenant-scoped users"
          loading={loading}
        />
        <MetricCard
          label="Active Users"
          value={stats.active}
          helpText="Currently active users"
          loading={loading}
        />
        <MetricCard
          label="Inactive Users"
          value={stats.inactive}
          helpText="Disabled from active use"
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
                placeholder="Search by username or email"
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
              ) : filteredUsers.length === 0 ? (
                <Box py={10} textAlign="center">
                  <UserCog size={28} style={{ margin: "0 auto" }} />
                  <Text fontWeight="600" mt={3}>
                    No users found
                  </Text>
                  <Text color="gray.500" mt={1}>
                    Create a user or adjust your filters.
                  </Text>
                </Box>
              ) : (
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th>Username</Th>
                      <Th>Email</Th>
                      <Th>Roles</Th>
                      <Th>Scope</Th>
                      <Th>Status</Th>
                      <Th>Updated By</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredUsers.map((user) => (
                      <Tr key={user.id}>
                        <Td>
                          <Text fontWeight="700">{user.username}</Text>
                        </Td>

                        <Td>{user.email || "—"}</Td>

                        <Td>
                          <HStack spacing={2} flexWrap="wrap">
                            {(user.roles || []).map((role) => (
                              <Badge key={role} colorScheme="blue">
                                {role}
                              </Badge>
                            ))}
                          </HStack>
                        </Td>

                        <Td>{user.scope || "TENANT"}</Td>

                        <Td>
                          <Badge colorScheme={user.active ? "green" : "gray"}>
                            {user.active ? "ACTIVE" : "INACTIVE"}
                          </Badge>
                        </Td>

                        <Td>{user.updatedBy || "—"}</Td>

                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              size="sm"
                              variant="outline"
                              icon={<Edit size={16} />}
                              aria-label="Edit user"
                              onClick={() => handleEdit(user)}
                            />
                            <IconButton
                              size="sm"
                              variant="outline"
                              colorScheme={user.active ? "red" : "green"}
                              icon={<Power size={16} />}
                              aria-label={
                                user.active
                                  ? "Deactivate user"
                                  : "Reactivate user"
                              }
                              onClick={() => handleToggleStatus(user)}
                            />
                            <IconButton
                              size="sm"
                              variant="outline"
                              colorScheme="blue"
                              icon={<RefreshCw size={16} />}
                              aria-label="Reset password"
                              onClick={() => handleResetPassword(user)}
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

      <TenantUserFormModal
        isOpen={isOpen}
        onClose={handleModalClose}
        onSuccess={() => loadPageData({ silent: true })}
        user={selectedUser}
      />

      <BulkImportModal
        isOpen={isImportOpen}
        onClose={onImportClose}
        entityName="User"
        previewColumns={userPreviewColumns}
        downloadTemplate={downloadUserTemplate}
        downloadErrors={downloadUserImportErrors}
        validateImport={validateUserImport}
        commitImport={commitUserImport}
        onSuccess={() =>
          loadPageData({
            silent: true,
          })
        }
      />
    </Stack>
  );
}
