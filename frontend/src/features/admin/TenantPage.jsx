import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Flex,
  HStack,
  Heading,
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
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  Search,
  Plus,
  RefreshCw,
  Eye,
  Power,
  RotateCcw,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import TenantCreateModal from "./TenantCreateModal";

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

export default function TenantPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const createModal = useDisclosure();

  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recentTenants: [],
  });

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

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionTenantId, setActionTenantId] = useState(null);

  const fetchTenants = async ({
    search = "",
    nextPage = 0,
    nextSize = size,
    silent = false,
  } = {}) => {
    if (!silent) setLoading(true);

    try {
      const res = await api.get("/api/platform/tenants", {
        params: {
          ...(search?.trim() ? { q: search.trim() } : {}),
          page: nextPage,
          size: nextSize,
          sort: "updatedAt,desc",
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
        title: "Failed to load tenants",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("/api/platform/tenants/stats");
      setStats(
        res.data || {
          total: 0,
          active: 0,
          inactive: 0,
          recentTenants: [],
        },
      );
    } catch {
      // non-blocking
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTenants({
      search: debouncedQuery,
      nextPage: 0,
      nextSize: size,
    });
  }, [debouncedQuery, size]);

  const handleRefresh = async () => {
    await Promise.all([
      fetchTenants({
        search: debouncedQuery,
        nextPage: page,
        nextSize: size,
      }),
      fetchStats(),
    ]);
  };

  const handleCreateTenant = async (payload) => {
    setSubmitting(true);
    try {
      await api.post("/api/platform/tenants", payload);

      toast({
        title: "Tenant created",
        description: "The tenant was created successfully.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      createModal.onClose();

      await Promise.all([
        fetchTenants({
          search: debouncedQuery,
          nextPage: 0,
          nextSize: size,
        }),
        fetchStats(),
      ]);
    } catch (error) {
      toast({
        title: "Failed to create tenant",
        description:
          error?.response?.data?.message ||
          "Please check the form and try again.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (tenantId) => {
    setActionTenantId(tenantId);
    try {
      await api.post(`/api/platform/tenants/${tenantId}/deactivate`);
      toast({
        title: "Tenant deactivated",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      await Promise.all([
        fetchTenants({
          search: debouncedQuery,
          nextPage: page,
          nextSize: size,
        }),
        fetchStats(),
      ]);
    } catch (error) {
      toast({
        title: "Failed to deactivate tenant",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionTenantId(null);
    }
  };

  const handleReactivate = async (tenantId) => {
    setActionTenantId(tenantId);
    try {
      await api.post(`/api/platform/tenants/${tenantId}/reactivate`);
      toast({
        title: "Tenant reactivated",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      await Promise.all([
        fetchTenants({
          search: debouncedQuery,
          nextPage: page,
          nextSize: size,
        }),
        fetchStats(),
      ]);
    } catch (error) {
      toast({
        title: "Failed to reactivate tenant",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionTenantId(null);
    }
  };

  const handlePageChange = async (nextPage) => {
    if (nextPage < 0 || nextPage >= pageInfo.totalPages) return;

    await fetchTenants({
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

  const tenantRows = useMemo(() => rows || [], [rows]);
  const visiblePageNumbers = useMemo(
    () => getPageNumbers(pageInfo.number, pageInfo.totalPages),
    [pageInfo.number, pageInfo.totalPages],
  );

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
          <Heading size="lg">Tenants</Heading>
          <Text color="gray.500" mt={1}>
            Manage platform tenants, status, and access lifecycle.
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
            Create Tenant
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Tenants</StatLabel>
              <StatNumber>{statsLoading ? "—" : stats.total}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Active</StatLabel>
              <StatNumber color="green.500">
                {statsLoading ? "—" : stats.active}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Inactive</StatLabel>
              <StatNumber color="orange.500">
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
                placeholder="Search by tenant name or GSTIN"
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
          ) : tenantRows.length === 0 ? (
            <Box py={10} textAlign="center">
              <Text fontWeight="600">No tenants found</Text>
              <Text color="gray.500" mt={1}>
                Create a tenant or adjust your search query.
              </Text>
            </Box>
          ) : (
            <>
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Name</Th>
                    <Th>GSTIN</Th>
                    <Th>Status</Th>
                    <Th>Created By</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {tenantRows.map((tenant) => (
                    <Tr key={tenant.tenantId}>
                      <Td>{tenant.tenantId}</Td>
                      <Td fontWeight="600">{tenant.name}</Td>
                      <Td>{tenant.gstin}</Td>
                      <Td>
                        <Badge colorScheme={tenant.active ? "green" : "orange"}>
                          {tenant.active ? "Active" : "Inactive"}
                        </Badge>
                      </Td>
                      <Td>{tenant.createdBy || "system"}</Td>
                      <Td>
                        <HStack spacing={2} flexWrap="wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<Eye size={14} />}
                            onClick={() =>
                              navigate(`/admin/tenants/${tenant.tenantId}`)
                            }
                          >
                            View
                          </Button>

                          {tenant.active ? (
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="orange"
                              leftIcon={<Power size={14} />}
                              onClick={() => handleDeactivate(tenant.tenantId)}
                              isLoading={actionTenantId === tenant.tenantId}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="green"
                              leftIcon={<RotateCcw size={14} />}
                              onClick={() => handleReactivate(tenant.tenantId)}
                              isLoading={actionTenantId === tenant.tenantId}
                            >
                              Reactivate
                            </Button>
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
                  Showing {from}-{to} of {pageInfo.totalElements} tenants
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

      <TenantCreateModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        onCreate={handleCreateTenant}
        isSubmitting={submitting}
      />
    </Stack>
  );
}
