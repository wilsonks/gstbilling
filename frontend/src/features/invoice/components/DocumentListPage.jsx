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
  InputGroup,
  InputLeftElement,
  Link as ChakraLink,
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
  useToast,
} from "@chakra-ui/react";
import {
  Download,
  Eye,
  FileText,
  Printer,
  RefreshCw,
  Search,
} from "lucide-react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  cancelInvoice,
  exportInvoicePdf,
  getInvoiceStats,
  getInvoicesPage,
  previewInvoicePdf,
} from "../invoiceApi";
import { resolveDocumentDetailPath } from "../documentRoutes";

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

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function statusColorScheme(status) {
  switch (status) {
    case "CANCELLED":
      return "red";
    case "ISSUED":
      return "green";
    case "CONVERTED":
      return "purple";
    case "EXPIRED":
      return "orange";
    default:
      return "gray";
  }
}

export default function DocumentListPage({
  title,
  description,
  documentType,
  createLabel,
  createPath,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ total: 0, recentInvoices: [] });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const [pageInfo, setPageInfo] = useState({
    totalElements: 0,
  });

  const showReferenceColumn =
    documentType === "CREDIT_NOTE" || documentType === "DEBIT_NOTE";

  const loadPageData = async ({ silent = false, search = query } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const [invoicePage, statsData] = await Promise.all([
        getInvoicesPage({
          ...(search?.trim() ? { q: search.trim() } : {}),
          page: 0,
          size: 50,
          sort: "updatedAt,desc",
        }),
        getInvoiceStats(),
      ]);

      const allRows = invoicePage?.content || [];
      const filteredByType = allRows.filter(
        (item) => (item.documentType || "TAX_INVOICE") === documentType,
      );

      setRows(filteredByType);
      setPageInfo({
        totalElements: filteredByType.length,
      });
      setStats(statsData || { total: 0, recentInvoices: [] });
    } catch (error) {
      toast({
        title: "Failed to load documents",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [documentType]);

  const filteredRows = useMemo(() => {
    return rows.filter((invoice) => {
      if (!statusFilter) return true;
      return String(invoice.status || "") === statusFilter;
    });
  }, [rows, statusFilter]);

  const issuedCount = useMemo(
    () => rows.filter((item) => item.status === "ISSUED").length,
    [rows],
  );

  const cancelledCount = useMemo(
    () => rows.filter((item) => item.status === "CANCELLED").length,
    [rows],
  );

  const totalValue = useMemo(() => {
    return rows.reduce(
      (sum, item) => sum + Number(item.totalInvoiceAmount || 0),
      0,
    );
  }, [rows]);

  const handleSearch = async () => {
    await loadPageData({ silent: true, search: query });
  };

  const handleCancelInvoice = async (invoice) => {
    try {
      await cancelInvoice(invoice.id);
      toast({
        title: "Document cancelled",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      await loadPageData({ silent: true });
    } catch (error) {
      toast({
        title: "Failed to cancel document",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDownloadPdf = async (invoice) => {
    setDownloadingId(invoice.id);
    try {
      const response = await exportInvoicePdf(invoice.id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      let fileName = `${invoice.invoiceNo || "document"}.pdf`;
      const disposition = response.headers?.["content-disposition"];
      const match = disposition?.match(/filename="(.+)"/);
      if (match?.[1]) fileName = match[1];

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Failed to export PDF",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePrintInvoice = async (invoice) => {
    try {
      const response = await previewInvoicePdf(invoice.id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (!win) {
        toast({
          title: "Popup blocked",
          description: "Please allow popups to preview the PDF.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (error) {
      toast({
        title: "Failed to open PDF",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleViewDocument = (invoice) => {
    navigate(resolveDocumentDetailPath(invoice), {
      state: {
        backgroundLocation: location,
        returnTo: location.pathname + location.search,
      },
    });
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
          <Heading size="lg">{title}</Heading>
          <Text color="gray.500" mt={1}>
            {description}
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
            colorScheme="blue"
            onClick={() =>
              navigate(createPath, {
                state: {
                  backgroundLocation: location,
                  returnTo: location.pathname + location.search,
                },
              })
            }
          >
            {createLabel}
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <MetricCard
          label="Total Documents"
          value={rows.length}
          helpText="Documents of this type"
          loading={loading}
        />
        <MetricCard
          label="Issued"
          value={issuedCount}
          helpText="Currently active"
          loading={loading}
        />
        <MetricCard
          label="Document Value"
          value={formatCurrency(totalValue)}
          helpText={`${cancelledCount} cancelled document(s)`}
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
            <Flex gap={3} direction={{ base: "column", md: "row" }}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Search size={16} color="#718096" />
                </InputLeftElement>
                <Input
                  placeholder="Search by number or customer name"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </InputGroup>

              <Button onClick={handleSearch}>Search</Button>

              <Input
                as="select"
                maxW={{ base: "100%", md: "220px" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="ISSUED">Issued</option>
                <option value="EXPIRED">Expired</option>
                <option value="CONVERTED">Converted</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="DRAFT">Draft</option>
              </Input>
            </Flex>

            <Box overflowX="auto">
              {loading ? (
                <Stack spacing={3}>
                  <Skeleton height="56px" />
                  <Skeleton height="56px" />
                  <Skeleton height="56px" />
                </Stack>
              ) : filteredRows.length === 0 ? (
                <Box py={10} textAlign="center">
                  <FileText size={28} style={{ margin: "0 auto" }} />
                  <Text fontWeight="600" mt={3}>
                    No documents found
                  </Text>
                </Box>
              ) : (
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th>No</Th>
                      <Th>Date</Th>
                      {showReferenceColumn && <Th>Reference Invoice</Th>}
                      <Th>Customer</Th>
                      <Th>Tax Type</Th>
                      <Th isNumeric>Grand Total</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredRows.map((invoice) => (
                      <Tr key={invoice.id}>
                        <Td>{invoice.invoiceNo}</Td>
                        <Td>
                          {invoice.invoiceDate
                            ? new Date(invoice.invoiceDate).toLocaleDateString()
                            : "—"}
                        </Td>
                        {showReferenceColumn && (
                          <Td>
                            {invoice.referenceInvoiceId ? (
                              <ChakraLink
                                as={RouterLink}
                                to={`/invoices/${invoice.referenceInvoiceId}`}
                                color="blue.600"
                                fontWeight="600"
                                state={{
                                  backgroundLocation: location,
                                  returnTo: location.pathname + location.search,
                                }}
                              >
                                {invoice.referenceInvoiceNo ||
                                  `Invoice #${invoice.referenceInvoiceId}`}
                              </ChakraLink>
                            ) : (
                              "—"
                            )}
                          </Td>
                        )}
                        <Td>{invoice.customerLegalName || "—"}</Td>
                        <Td>{invoice.taxType?.replaceAll("_", " ") || "—"}</Td>
                        <Td isNumeric>
                          {formatCurrency(invoice.totalInvoiceAmount)}
                        </Td>
                        <Td>
                          <Badge colorScheme={statusColorScheme(invoice.status)}>
                            {invoice.status || "—"}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              size="sm"
                              variant="outline"
                              aria-label="View"
                              icon={<Eye size={14} />}
                              onClick={() => handleViewDocument(invoice)}
                            />
                            <IconButton
                              size="sm"
                              variant="outline"
                              aria-label="Print"
                              icon={<Printer size={14} />}
                              onClick={() => handlePrintInvoice(invoice)}
                            />
                            <IconButton
                              size="sm"
                              variant="outline"
                              aria-label="Download PDF"
                              icon={<Download size={14} />}
                              onClick={() => handleDownloadPdf(invoice)}
                              isLoading={downloadingId === invoice.id}
                            />
                            {invoice.status !== "CANCELLED" &&
                              !(invoice.documentType === "PROFORMA_INVOICE" && invoice.convertedToInvoiceId) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  colorScheme="red"
                                  onClick={() => handleCancelInvoice(invoice)}
                                >
                                  Cancel
                                </Button>
                              )}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>

            {!loading && filteredRows.length > 0 && (
              <Text fontSize="sm" color="gray.500">
                Showing {filteredRows.length} of {pageInfo.totalElements}{" "}
                document(s)
              </Text>
            )}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}