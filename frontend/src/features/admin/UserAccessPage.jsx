import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Ban,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import api from "../../services/api";
import UserAccessCreateModal from "./UserAccessCreateModal";
import UserAccessEditModal from "./UserAccessEditModal";

const DEFAULT_PAGE_SIZE = 5;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 1) return [0];

  const pages = new Set([0, totalPages - 1, currentPage]);

  if (currentPage - 1 >= 0) pages.add(currentPage - 1);
  if (currentPage + 1 < totalPages) pages.add(currentPage + 1);
  if (currentPage - 2 >= 0) pages.add(currentPage - 2);
  if (currentPage + 2 < totalPages) pages.add(currentPage + 2);

  return [...pages].sort((a, b) => a - b);
}

function ActiveBadge({ active }) {
  return (
    <Badge colorScheme={active ? "green" : "red"}>
      {active ? "ACTIVE" : "INACTIVE"}
    </Badge>
  );
}

export default function UserAccessPage() {
  const toast = useToast();
  const createModal = useDisclosure();
  const editModal = useDisclosure();

  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 400);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);

  const [pageInfo, setPageInfo] = useState({
    number: 0,
    size: DEFAULT_PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    numberOfElements: 0,
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recentAccesses: [],
  });

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [revokingId, setRevokingId] = useState(null);
  const [editingAccess, setEditingAccess] = useState(null);

  const fetchAccesses = async ({
    search = "",
    nextPage = 0,
    nextSize = size,
  } = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/api/platform/user-access", {
        params: {
          ...(search?.trim() ? { q: search.trim() } : {}),
          page: nextPage,
          size: nextSize,
        },
      });

      const data = res.data || {};

      setRows(data.content || []);
      setPageInfo({
        number: data.number ?? 0,
        size: data.size ?? nextSize,
        totalElements: data.totalElements ?? 0,
        totalPages: data.totalPages ?? 0,
        first: data.first ?? true,
        last: data.last ?? true,
        numberOfElements: data.numberOfElements ?? (data.content || []).length,
      });
      setPage(data.number ?? nextPage);
    } catch (error) {
      toast({
        title: "Failed to load user accesses",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

      setRows([]);
      setPageInfo({
        number: 0,
        size: nextSize,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
        numberOfElements: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("/api/platform/user-access/stats");
      setStats(
        res.data || {
          total: 0,
          active: 0,
          inactive: 0,
          recentAccesses: [],
        },
      );
    } catch (error) {
      setStats({
        total: 0,
        active: 0,
        inactive: 0,
        recentAccesses: [],
      });

      toast({
        title: "Failed to load access stats",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchAccesses({
      search: debouncedQuery,
      nextPage: 0,
      nextSize: size,
    });
  }, [debouncedQuery, size]);

  const handleRefresh = async () => {
    await Promise.all([
      fetchAccesses({
        search: debouncedQuery,
        nextPage: page,
        nextSize: size,
      }),
      fetchStats(),
    ]);
  };

  const handleCreateAccess = async (payload) => {
    setIsCreating(true);
    try {
      await api.post("/api/platform/user-access", payload);

      toast({
        title: "Access granted",
        description: "User access was created successfully.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      createModal.onClose();

      await Promise.all([
        fetchAccesses({
          search: debouncedQuery,
          nextPage: 0,
          nextSize: size,
        }),
        fetchStats(),
      ]);
    } catch (error) {
      toast({
        title: "Failed to create access",
        description:
          error?.response?.data?.message ||
          "Please check the form and try again.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateAccess = async (payload) => {
    if (!editingAccess) return;

    setIsSaving(true);
    try {
      await api.put(`/api/platform/user-access/${editingAccess.id}`, payload);

      toast({
        title: "Access updated",
        description: "Changes saved successfully.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      editModal.onClose();
      setEditingAccess(null);

      await Promise.all([
        fetchAccesses({
          search: debouncedQuery,
          nextPage: page,
          nextSize: size,
        }),
        fetchStats(),
      ]);
    } catch (error) {
      toast({
        title: "Failed to update access",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevoke = async (access) => {
    setRevokingId(access.id);
    try {
      await api.post(`/api/platform/user-access/${access.id}/revoke`);

      toast({
        title: "Access revoked",
        description: "The access entry is now inactive.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      await Promise.all([
        fetchAccesses({
          search: debouncedQuery,
          nextPage: page,
          nextSize: size,
        }),
        fetchStats(),
      ]);
    } catch (error) {
      toast({
        title: "Failed to revoke access",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setRevokingId(null);
    }
  };

  const handleEditClick = (access) => {
    setEditingAccess(access);
    editModal.onOpen();
  };

  const handlePageChange = async (nextPage) => {
    if (nextPage < 0 || nextPage >= pageInfo.totalPages) return;

    await fetchAccesses({
      search: debouncedQuery,
      nextPage,
      nextSize: size,
    });
  };

  const handlePageSizeChange = (e) => {
    const nextSize = Number(e.target.value);
    setSize(nextSize);
    setPage(0);
  };

  const visiblePageNumbers = useMemo(
    () => getPageNumbers(pageInfo.number, pageInfo.totalPages),
    [pageInfo.number, pageInfo.totalPages],
  );

  const accessRows = useMemo(() => rows || [], [rows]);

  const from =
    pageInfo.totalElements === 0 ? 0 : pageInfo.number * pageInfo.size + 1;

  const to =
    pageInfo.totalElements === 0
      ? 0
      : pageInfo.number * pageInfo.size + pageInfo.numberOfElements;

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
            Manage company-level access for users.
          </Text>
        </Box>

        <HStack spacing={3} flexWrap="wrap">
          <Button
            leftIcon={<RefreshCw size={16} />}
            variant="outline"
            onClick={handleRefresh}
            isLoading={loading || statsLoading}
          >
            Refresh
          </Button>

          <Button leftIcon={<Plus size={16} />} onClick={createModal.onOpen}>
            Grant Access
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Access Records</StatLabel>
              <StatNumber>{statsLoading ? "—" : stats.total}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Active Access</StatLabel>
              <StatNumber color="green.500">
                {statsLoading ? "—" : stats.active}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Inactive Access</StatLabel>
              <StatNumber color="red.500">
                {statsLoading ? "—" : stats.inactive}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card>
        <CardBody>
          <Flex
            gap={3}
            direction={{ base: "column", md: "row" }}
            align={{ base: "stretch", md: "center" }}
            justify="space-between"
          >
            <InputGroup maxW={{ base: "100%", md: "420px" }}>
              <InputLeftElement pointerEvents="none">
                <Search size={16} color="#718096" />
              </InputLeftElement>

              <Input
                placeholder="Search by user/company/tenant ID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>

            <HStack>
              <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                Rows per page
              </Text>
              <Select value={size} onChange={handlePageSizeChange} w="100px">
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </HStack>
          </Flex>
        </CardBody>
      </Card>

      <Card>
        <CardBody overflowX="auto">
          {loading ? (
            <Flex justify="center" py={10}>
              <Spinner />
            </Flex>
          ) : accessRows.length === 0 ? (
            <Box py={10} textAlign="center">
              <ShieldCheck size={28} style={{ margin: "0 auto 12px" }} />
              <Text fontWeight="600">No access records found</Text>
              <Text color="gray.500" mt={1}>
                Grant access or adjust your search query.
              </Text>
            </Box>
          ) : (
            <>
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>User ID</Th>
                    <Th>Company ID</Th>
                    <Th>Tenant ID</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {accessRows.map((access) => (
                    <Tr key={access.id}>
                      <Td>{access.id}</Td>
                      <Td>{access.userId}</Td>
                      <Td>{access.companyId}</Td>
                      <Td>{access.tenantId}</Td>
                      <Td>
                        <Badge colorScheme="gray">
                          {access.role?.replaceAll("_", " ") || "—"}
                        </Badge>
                      </Td>
                      <Td>
                        <ActiveBadge active={access.active} />
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="View access">
                            <IconButton
                              as={RouterLink}
                              to={`/admin/user-access/${access.id}`}
                              size="sm"
                              variant="outline"
                              icon={<Eye size={14} />}
                              aria-label={`View access ${access.id}`}
                            />
                          </Tooltip>

                          <Tooltip label="Edit access">
                            <IconButton
                              size="sm"
                              variant="outline"
                              icon={<Pencil size={14} />}
                              aria-label={`Edit access ${access.id}`}
                              onClick={() => handleEditClick(access)}
                            />
                          </Tooltip>

                          {access.active && (
                            <Tooltip label="Revoke access">
                              <IconButton
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                icon={<Ban size={14} />}
                                aria-label={`Revoke access ${access.id}`}
                                onClick={() => handleRevoke(access)}
                                isLoading={revokingId === access.id}
                              />
                            </Tooltip>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              <Flex
                mt={5}
                gap={4}
                justify="space-between"
                align={{ base: "stretch", lg: "center" }}
                direction={{ base: "column", lg: "row" }}
              >
                <Text color="gray.500" fontSize="sm">
                  Showing {from}-{to} of {pageInfo.totalElements} access records
                </Text>

                <Flex
                  gap={3}
                  align={{ base: "stretch", md: "center" }}
                  direction={{ base: "column", md: "row" }}
                >
                  <Text color="gray.500" fontSize="sm" whiteSpace="nowrap">
                    Page {pageInfo.number + 1} of{" "}
                    {Math.max(pageInfo.totalPages, 1)}
                  </Text>

                  <ButtonGroup size="sm" isAttached variant="outline">
                    <Button
                      onClick={() => handlePageChange(0)}
                      isDisabled={pageInfo.first}
                    >
                      <ChevronsLeft size={16} />
                    </Button>

                    <Button
                      onClick={() => handlePageChange(pageInfo.number - 1)}
                      isDisabled={pageInfo.first}
                    >
                      <ChevronLeft size={16} />
                    </Button>

                    {visiblePageNumbers.map((pageNumber, index) => {
                      const prev = visiblePageNumbers[index - 1];
                      const showGap = index > 0 && pageNumber - prev > 1;

                      return (
                        <React.Fragment key={pageNumber}>
                          {showGap && (
                            <Button isDisabled variant="ghost">
                              ...
                            </Button>
                          )}

                          <Button
                            onClick={() => handlePageChange(pageNumber)}
                            variant={
                              pageNumber === pageInfo.number
                                ? "solid"
                                : "outline"
                            }
                          >
                            {pageNumber + 1}
                          </Button>
                        </React.Fragment>
                      );
                    })}

                    <Button
                      onClick={() => handlePageChange(pageInfo.number + 1)}
                      isDisabled={pageInfo.last}
                    >
                      <ChevronRight size={16} />
                    </Button>

                    <Button
                      onClick={() => handlePageChange(pageInfo.totalPages - 1)}
                      isDisabled={pageInfo.last}
                    >
                      <ChevronsRight size={16} />
                    </Button>
                  </ButtonGroup>
                </Flex>
              </Flex>
            </>
          )}
        </CardBody>
      </Card>

      <UserAccessCreateModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        onCreate={handleCreateAccess}
        isSubmitting={isCreating}
      />

      <UserAccessEditModal
        isOpen={editModal.isOpen}
        onClose={() => {
          editModal.onClose();
          setEditingAccess(null);
        }}
        access={editingAccess}
        onSave={handleUpdateAccess}
        isSubmitting={isSaving}
      />
    </Stack>
  );
}
