import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Flex,
  Grid,
  GridItem,
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
  Download,
  Eye,
  RefreshCw,
  Search,
  Shield,
  X,
} from "lucide-react";
import api from "../../services/api";
import AuditLogDetailsModal from "./AuditLogDetailsModal";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const ACTION_OPTIONS = [
  { value: "REGISTER_SUCCESS", label: "REGISTER SUCCESS" },
  { value: "REGISTER_FAILED", label: "REGISTER FAILED" },
  { value: "LOGIN_SUCCESS", label: "LOGIN SUCCESS" },
  { value: "LOGIN_FAILED", label: "LOGIN FAILED" },
  { value: "REFRESH_SUCCESS", label: "REFRESH SUCCESS" },
  { value: "REFRESH_FAILED", label: "REFRESH FAILED" },
  { value: "SWITCH_COMPANY_SUCCESS", label: "SWITCH COMPANY SUCCESS" },
  { value: "SWITCH_COMPANY_FAILED", label: "SWITCH COMPANY FAILED" },
  { value: "LOGOUT_SUCCESS", label: "LOGOUT SUCCESS" },
];

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

function getActionColorScheme(action) {
  const normalized = String(action || "").toUpperCase();

  if (normalized === "LOGIN_SUCCESS") return "green";
  if (normalized === "LOGIN_FAILED") return "red";
  if (normalized === "REGISTER_SUCCESS") return "teal";
  if (normalized === "REGISTER_FAILED") return "red";
  if (normalized === "REFRESH_SUCCESS") return "yellow";
  if (normalized === "REFRESH_FAILED") return "red";
  if (normalized === "SWITCH_COMPANY_SUCCESS") return "cyan";
  if (normalized === "SWITCH_COMPANY_FAILED") return "red";
  if (normalized === "LOGOUT_SUCCESS") return "gray";

  if (normalized.includes("SUCCESS")) return "green";
  if (normalized.includes("FAILED") || normalized.includes("FAIL"))
    return "red";
  if (normalized.includes("REGISTER")) return "teal";
  if (normalized.includes("REFRESH")) return "yellow";
  if (normalized.includes("SWITCH_COMPANY")) return "cyan";
  if (normalized.includes("LOGIN")) return "purple";

  return "gray";
}

function ActionBadge({ action }) {
  return (
    <Badge colorScheme={getActionColorScheme(action)}>{action || "—"}</Badge>
  );
}

function formatDateTime(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function toIsoDateTimeStart(dateValue) {
  if (!dateValue) return undefined;
  return `${dateValue}T00:00:00`;
}

function toIsoDateTimeEnd(dateValue) {
  if (!dateValue) return undefined;
  return `${dateValue}T23:59:59`;
}

function downloadCsv(filename, rows) {
  const escapeCell = (value) => {
    const text = value == null ? "" : String(value);
    return `"${text.replaceAll('"', '""')}"`;
  };

  const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export default function AuditLogsPage() {
  const toast = useToast();
  const detailsModal = useDisclosure();

  const [rows, setRows] = useState([]);
  const [selectedAuditId, setSelectedAuditId] = useState(null);

  const [query, setQuery] = useState("");
  const [username, setUsername] = useState("");
  const [action, setAction] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [ip, setIp] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const debouncedQuery = useDebouncedValue(query, 400);
  const debouncedUsername = useDebouncedValue(username, 400);
  const debouncedIp = useDebouncedValue(ip, 400);

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
    today: 0,
    uniqueUsers: 0,
    recent: [],
  });

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const filters = useMemo(
    () => ({
      q: debouncedQuery.trim() || undefined,
      username: debouncedUsername.trim() || undefined,
      action: action || undefined,
      companyId:
        String(companyId).trim() && !Number.isNaN(Number(companyId))
          ? Number(companyId)
          : undefined,
      ip: debouncedIp.trim() || undefined,
      from: toIsoDateTimeStart(fromDate),
      to: toIsoDateTimeEnd(toDate),
    }),
    [
      debouncedQuery,
      debouncedUsername,
      action,
      companyId,
      debouncedIp,
      fromDate,
      toDate,
    ],
  );

  const fetchAuditLogs = async ({
    nextPage = 0,
    nextSize = size,
    appliedFilters = filters,
  } = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/api/platform/audit-logs", {
        params: {
          ...appliedFilters,
          page: nextPage,
          size: nextSize,
          sort: "timestamp,desc",
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
        title: "Failed to load audit logs",
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
      const res = await api.get("/api/platform/audit-logs/stats");
      setStats(
        res.data || {
          total: 0,
          today: 0,
          uniqueUsers: 0,
          recent: [],
        },
      );
    } catch (error) {
      setStats({
        total: 0,
        today: 0,
        uniqueUsers: 0,
        recent: [],
      });

      toast({
        title: "Failed to load audit stats",
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
    fetchAuditLogs({
      nextPage: 0,
      nextSize: size,
      appliedFilters: filters,
    });
  }, [filters, size]);

  const handleRefresh = async () => {
    await Promise.all([
      fetchAuditLogs({
        nextPage: page,
        nextSize: size,
        appliedFilters: filters,
      }),
      fetchStats(),
    ]);
  };

  const handleClearFilters = () => {
    setQuery("");
    setUsername("");
    setAction("");
    setCompanyId("");
    setIp("");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  const handlePageChange = async (nextPage) => {
    if (nextPage < 0 || nextPage >= pageInfo.totalPages) return;

    await fetchAuditLogs({
      nextPage,
      nextSize: size,
      appliedFilters: filters,
    });
  };

  const handlePageSizeChange = (e) => {
    const nextSize = Number(e.target.value);
    setSize(nextSize);
    setPage(0);
  };

  const handleOpenDetails = (auditId) => {
    setSelectedAuditId(auditId);
    detailsModal.onOpen();
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const res = await api.get("/api/platform/audit-logs", {
        params: {
          ...filters,
          page: 0,
          size: 1000,
          sort: "timestamp,desc",
        },
      });

      const exportRows = res.data?.content || [];

      downloadCsv(`audit-logs-${new Date().toISOString().slice(0, 10)}.csv`, [
        ["ID", "Timestamp", "Username", "Action", "Company ID", "IP"],
        ...exportRows.map((row) => [
          row.id,
          row.timestamp,
          row.username,
          row.action,
          row.companyId ?? "",
          row.ip ?? "",
        ]),
      ]);

      toast({
        title: "Export complete",
        description: "Audit logs were exported to CSV.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to export audit logs",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setExporting(false);
    }
  };

  const visiblePageNumbers = useMemo(
    () => getPageNumbers(pageInfo.number, pageInfo.totalPages),
    [pageInfo.number, pageInfo.totalPages],
  );

  const auditRows = useMemo(() => rows || [], [rows]);

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
          <Heading size="lg">Audit Logs</Heading>
          <Text color="gray.500" mt={1}>
            Search, review, and export authentication and access audit events.
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

          <Button
            leftIcon={<Download size={16} />}
            onClick={handleExportCsv}
            isLoading={exporting}
          >
            Export CSV
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Events</StatLabel>
              <StatNumber>{statsLoading ? "—" : stats.total}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Today</StatLabel>
              <StatNumber color="blue.500">
                {statsLoading ? "—" : stats.today}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Unique Users</StatLabel>
              <StatNumber color="purple.500">
                {statsLoading ? "—" : stats.uniqueUsers}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card>
        <CardBody>
          <Stack spacing={4}>
            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr 1fr" }} gap={3}>
              <GridItem>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Search size={16} color="#718096" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search username, action, or IP"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </InputGroup>
              </GridItem>

              <GridItem>
                <Input
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </GridItem>

              <GridItem>
                <Select
                  placeholder="Filter by action"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                >
                  {ACTION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </GridItem>
            </Grid>

            <Grid
              templateColumns={{
                base: "1fr",
                md: "1fr 1fr",
                xl: "1fr 1fr 1fr 1fr auto",
              }}
              gap={3}
              alignItems="end"
            >
              <GridItem>
                <Input
                  placeholder="Company ID"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                />
              </GridItem>

              <GridItem>
                <Input
                  placeholder="IP address"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                />
              </GridItem>

              <GridItem>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    From
                  </Text>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Box>
              </GridItem>

              <GridItem>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    To
                  </Text>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Box>
              </GridItem>

              <GridItem>
                <Button
                  variant="ghost"
                  leftIcon={<X size={16} />}
                  onClick={handleClearFilters}
                  w={{ base: "100%", xl: "auto" }}
                >
                  Clear
                </Button>
              </GridItem>
            </Grid>
          </Stack>
        </CardBody>
      </Card>

      <Card>
        <CardBody overflowX="auto">
          {loading ? (
            <Flex justify="center" py={10}>
              <Spinner />
            </Flex>
          ) : auditRows.length === 0 ? (
            <Box py={10} textAlign="center">
              <Shield size={28} style={{ margin: "0 auto 12px" }} />
              <Text fontWeight="600">No audit logs found</Text>
              <Text color="gray.500" mt={1}>
                Adjust your filters or try a different search query.
              </Text>
            </Box>
          ) : (
            <>
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>Timestamp</Th>
                    <Th>Username</Th>
                    <Th>Action</Th>
                    <Th>Company ID</Th>
                    <Th>IP</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {auditRows.map((audit) => (
                    <Tr key={audit.id}>
                      <Td whiteSpace="nowrap">
                        {formatDateTime(audit.timestamp)}
                      </Td>
                      <Td>{audit.username || "—"}</Td>
                      <Td>
                        <ActionBadge action={audit.action} />
                      </Td>
                      <Td>{audit.companyId ?? "—"}</Td>
                      <Td>{audit.ip || "—"}</Td>
                      <Td>
                        <Tooltip label="View details">
                          <IconButton
                            size="sm"
                            variant="outline"
                            icon={<Eye size={14} />}
                            aria-label={`View audit log ${audit.id}`}
                            onClick={() => handleOpenDetails(audit.id)}
                          />
                        </Tooltip>
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
                  Showing {from}-{to} of {pageInfo.totalElements} audit logs
                </Text>

                <Flex
                  gap={3}
                  align={{ base: "stretch", md: "center" }}
                  direction={{ base: "column", md: "row" }}
                >
                  <HStack>
                    <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                      Rows per page
                    </Text>
                    <Select
                      value={size}
                      onChange={handlePageSizeChange}
                      w="100px"
                    >
                      {PAGE_SIZE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </HStack>

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

      <AuditLogDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => {
          detailsModal.onClose();
          setSelectedAuditId(null);
        }}
        auditId={selectedAuditId}
      />
    </Stack>
  );
}
