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
  Plus,
  Printer,
  RefreshCw,
  Search,
} from "lucide-react";
import { useNavigate, generatePath } from "react-router-dom";
import {
  cancelInvoice,
  exportInvoicePdf,
  previewInvoicePdf,
  getInvoiceStats,
  getInvoicesPage,
  getInvoicePdfUrl,
} from "./invoiceApi";

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

export default function InvoicePage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    recentInvoices: [],
  });

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const [pageInfo, setPageInfo] = useState({
    number: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    numberOfElements: 0,
  });

  const [statusFilter, setStatusFilter] = useState("");

  const loadPageData = async ({ silent = false, search = query } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [invoicePage, statsData] = await Promise.all([
        getInvoicesPage({
          ...(search?.trim() ? { q: search.trim() } : {}),
          page: 0,
          size: 50,
        }),
        getInvoiceStats(),
      ]);

      setRows(invoicePage?.content || []);
      setPageInfo({
        number: invoicePage?.number ?? 0,
        size: invoicePage?.size ?? 10,
        totalElements: invoicePage?.totalElements ?? 0,
        totalPages: invoicePage?.totalPages ?? 0,
        numberOfElements: invoicePage?.numberOfElements ?? 0,
      });

      setStats(
        statsData || {
          total: 0,
          recentInvoices: [],
        },
      );
    } catch (error) {
      toast({
        title: "Failed to load invoices",
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
        title: "Invoice cancelled",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      await loadPageData({ silent: true });
    } catch (error) {
      toast({
        title: "Failed to cancel invoice",
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

      let fileName = `${invoice.invoiceNo || "invoice"}.pdf`;
      const disposition = response.headers?.["content-disposition"];
      const match = disposition?.match(/filename="(.+)"/);
      if (match?.[1]) {
        fileName = match[1];
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Invoice PDF downloaded",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to export invoice PDF",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  // const handlePrintInvoice = (invoice) => {
  //   const path = generatePath("/invoices/:id", { id: invoice.id });
  //   window.open(`${window.location.origin}${path}?print=1`, "_blank");
  // };

  // const handlePrintInvoice = (invoice) => {
  //   window.open(
  //     getInvoicePdfUrl(invoice.id, "inline"),
  //     "_blank",
  //     "noopener,noreferrer",
  //   );
  // };

  const handlePrintInvoice = async (invoice) => {
    try {
      const response = await previewInvoicePdf(invoice.id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const newWindow = window.open(url, "_blank", "noopener,noreferrer");

      if (!newWindow) {
        toast({
          title: "Popup blocked",
          description: "Please allow popups to preview the invoice PDF.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      toast({
        title: "Failed to open invoice PDF",
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
          <Heading size="lg">Invoices</Heading>
          <Text color="gray.500" mt={1}>
            View, search, manage, print, and export invoices.
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
            onClick={() => navigate("/invoices/new")}
          >
            New Invoice
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <MetricCard
          label="Total Invoices"
          value={stats.total}
          helpText="All invoices for current company"
          loading={loading}
        />
        <MetricCard
          label="Issued"
          value={issuedCount}
          helpText="Currently active invoices"
          loading={loading}
        />
        <MetricCard
          label="Invoice Value"
          value={formatCurrency(totalValue)}
          helpText={`${cancelledCount} cancelled invoice(s)`}
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
            <Flex
              gap={3}
              direction={{ base: "column", md: "row" }}
              align={{ base: "stretch", md: "center" }}
            >
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Search size={16} color="#718096" />
                </InputLeftElement>
                <Input
                  placeholder="Search by invoice number or customer name"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
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
                  <Skeleton height="56px" />
                </Stack>
              ) : filteredRows.length === 0 ? (
                <Box py={10} textAlign="center">
                  <FileText size={28} style={{ margin: "0 auto" }} />
                  <Text fontWeight="600" mt={3}>
                    No invoices found
                  </Text>
                  <Text color="gray.500" mt={1}>
                    Create an invoice or adjust your search filters.
                  </Text>
                </Box>
              ) : (
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th>Invoice No</Th>
                      <Th>Date</Th>
                      <Th>Customer</Th>
                      <Th>Tax Type</Th>
                      <Th isNumeric>Taxable</Th>
                      <Th isNumeric>Total Tax</Th>
                      <Th isNumeric>Grand Total</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredRows.map((invoice) => (
                      <Tr key={invoice.id}>
                        <Td>
                          <Stack spacing={0}>
                            <Text fontWeight="700">{invoice.invoiceNo}</Text>
                            <Text fontSize="xs" color="gray.500">
                              Due:{" "}
                              {invoice.dueDate
                                ? new Date(invoice.dueDate).toLocaleDateString()
                                : "—"}
                            </Text>
                          </Stack>
                        </Td>

                        <Td>
                          {invoice.invoiceDate
                            ? new Date(invoice.invoiceDate).toLocaleDateString()
                            : "—"}
                        </Td>

                        <Td>
                          <Stack spacing={0}>
                            <Text fontWeight="600">
                              {invoice.customerLegalName || "—"}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {invoice.customerCode || "—"}
                            </Text>
                          </Stack>
                        </Td>

                        <Td>{invoice.taxType?.replaceAll("_", " ") || "—"}</Td>

                        <Td isNumeric>
                          {formatCurrency(invoice.totalTaxableAmount)}
                        </Td>
                        <Td isNumeric>
                          {formatCurrency(invoice.totalTaxAmount)}
                        </Td>
                        <Td isNumeric>
                          {formatCurrency(invoice.totalInvoiceAmount)}
                        </Td>

                        <Td>
                          <Badge
                            colorScheme={
                              invoice.status === "CANCELLED"
                                ? "red"
                                : invoice.status === "ISSUED"
                                  ? "green"
                                  : "gray"
                            }
                          >
                            {invoice.status || "—"}
                          </Badge>
                        </Td>

                        <Td>
                          <HStack spacing={2} flexWrap="wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              leftIcon={<Eye size={14} />}
                              onClick={() =>
                                navigate(`/invoices/${invoice.id}`)
                              }
                            >
                              View
                            </Button>

                            <IconButton
                              size="sm"
                              variant="outline"
                              aria-label="Print invoice"
                              icon={<Printer size={14} />}
                              onClick={() => handlePrintInvoice(invoice)}
                            />

                            <IconButton
                              size="sm"
                              variant="outline"
                              aria-label="Download invoice PDF"
                              icon={<Download size={14} />}
                              onClick={() => handleDownloadPdf(invoice)}
                              isLoading={downloadingId === invoice.id}
                            />

                            {invoice.status !== "CANCELLED" && (
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
                invoice(s)
              </Text>
            )}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
