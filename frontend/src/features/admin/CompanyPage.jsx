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
  Building2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import CompanyCreateModal from "./CompanyCreateModal";

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

function formatCompanyType(type) {
  return type ? type.replaceAll("_", " ") : "—";
}

function formatAddress(company) {
  const parts = [
    company.addressLine1,
    company.addressLine2,
    company.city,
    company.state,
    company.pincode,
    company.country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "—";
}

export default function CompanyPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const createModal = useDisclosure();

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
    recentCompanies: [],
  });

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionCompanyId, setActionCompanyId] = useState(null);

  const fetchCompanies = async ({
    search = "",
    nextPage = 0,
    nextSize = size,
  } = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/api/platform/companies", {
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
        title: "Failed to load companies",
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
      const res = await api.get("/api/platform/companies/stats");
      setStats(
        res.data || {
          total: 0,
          active: 0,
          inactive: 0,
          recentCompanies: [],
        }
      );
    } catch (error) {
      setStats({
        total: 0,
        active: 0,
        inactive: 0,
        recentCompanies: [],
      });

      toast({
        title: "Failed to load company stats",
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
    fetchCompanies({
      search: debouncedQuery,
      nextPage: 0,
      nextSize: size,
    });
  }, [debouncedQuery, size]);

  const handleRefresh = async () => {
    await Promise.all([
      fetchCompanies({
        search: debouncedQuery,
        nextPage: page,
        nextSize: size,
      }),
      fetchStats(),
    ]);
  };

  const handleCreateCompany = async (payload) => {
    setSubmitting(true);
    try {
      await api.post("/api/platform/companies", payload);

      toast({
        title: "Company created",
        description: "The company was created successfully.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      createModal.onClose();

      await Promise.all([
        fetchCompanies({
          search: debouncedQuery,
          nextPage: 0,
          nextSize: size,
        }),
        fetchStats(),
      ]);
    } catch (error) {
      toast({
        title: "Failed to create company",
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

  const handleDeactivate = async (companyId) => {
    setActionCompanyId(companyId);
    try {
      await api.post(`/api/platform/companies/${companyId}/deactivate`);

      toast({
        title: "Company deactivated",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      await Promise.all([
        fetchCompanies({
          search: debouncedQuery,
          nextPage: page,
          nextSize: size,
        }),
        fetchStats(),
      ]);
    } catch (error) {
      toast({
        title: "Failed to deactivate company",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionCompanyId(null);
    }
  };

  const handleReactivate = async (companyId) => {
    setActionCompanyId(companyId);
    try {
      await api.post(`/api/platform/companies/${companyId}/reactivate`);

      toast({
        title: "Company reactivated",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      await Promise.all([
        fetchCompanies({
          search: debouncedQuery,
          nextPage: page,
          nextSize: size,
        }),
        fetchStats(),
      ]);
    } catch (error) {
      toast({
        title: "Failed to reactivate company",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionCompanyId(null);
    }
  };

  const handlePageChange = async (nextPage) => {
    if (nextPage < 0 || nextPage >= pageInfo.totalPages) return;

    await fetchCompanies({
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
    [pageInfo.number, pageInfo.totalPages]
  );

  const companyRows = useMemo(() => rows || [], [rows]);

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
          <Heading size="lg">Companies</Heading>
          <Text color="gray.500" mt={1}>
            Manage tenant companies across the platform with invoice-ready seller details.
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
            Create Company
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Companies</StatLabel>
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
                placeholder="Search by company name or GSTIN"
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
          ) : companyRows.length === 0 ? (
            <Box py={10} textAlign="center">
              <Building2 size={28} style={{ margin: "0 auto 12px" }} />
              <Text fontWeight="600">No companies found</Text>
              <Text color="gray.500" mt={1}>
                Create a company or adjust your search query.
              </Text>
            </Box>
          ) : (
            <>
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Name</Th>
                    <Th>Legal / Trade Name</Th>
                    <Th>GSTIN</Th>
                    <Th>Location</Th>
                    <Th>Tenant ID</Th>
                    <Th>Type</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {companyRows.map((company) => (
                    <Tr key={company.id}>
                      <Td>{company.id}</Td>
                      <Td fontWeight="600">{company.name}</Td>
                      <Td>
                        <Stack spacing={0}>
                          <Text fontWeight="500">{company.legalName || "—"}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {company.tradeName || "—"}
                          </Text>
                        </Stack>
                      </Td>
                      <Td>{company.gstin}</Td>
                      <Td maxW="260px">
                        <Stack spacing={0}>
                          <Text>{[company.city, company.state].filter(Boolean).join(", ") || "—"}</Text>
                          <Text fontSize="xs" color="gray.500" noOfLines={2}>
                            {formatAddress(company)}
                          </Text>
                        </Stack>
                      </Td>
                      <Td>{company.tenantId}</Td>
                      <Td>{formatCompanyType(company.type)}</Td>
                      <Td>
                        <Badge colorScheme={company.active ? "green" : "orange"}>
                          {company.active ? "Active" : "Inactive"}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2} flexWrap="wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<Eye size={14} />}
                            onClick={() =>
                              navigate(`/admin/companies/${company.id}`)
                            }
                          >
                            View
                          </Button>

                          {company.active ? (
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="orange"
                              leftIcon={<Power size={14} />}
                              onClick={() => handleDeactivate(company.id)}
                              isLoading={actionCompanyId === company.id}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="green"
                              leftIcon={<RotateCcw size={14} />}
                              onClick={() => handleReactivate(company.id)}
                              isLoading={actionCompanyId === company.id}
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
                  Showing {from}-{to} of {pageInfo.totalElements} companies
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

      <CompanyCreateModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        onCreate={handleCreateCompany}
        isSubmitting={submitting}
      />
    </Stack>
  );
}