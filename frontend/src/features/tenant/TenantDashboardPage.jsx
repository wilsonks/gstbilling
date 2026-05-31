import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
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
  Building2,
  FileText,
  Hash,
  Package,
  RefreshCw,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getMyCompanies } from "../company/companyApi";
import { getProductStats } from "../product/productApi";
import { getCustomerStats } from "../customer/customerApi";
import { getInvoiceStats, getInvoicesPage } from "../invoice/invoiceApi";
import { getInvoiceSequences } from "../invoice-sequence/invoiceSequenceApi";
import { setCompanyList } from "../company/companySlice";

function MetricCard({
  label,
  value,
  helpText,
  icon,
  loading = false,
  accent = "blue.500",
}) {
  return (
    <Card
      borderWidth="1px"
      borderColor="gray.200"
      shadow="sm"
      borderRadius="xl"
    >
      <CardBody>
        <HStack justify="space-between" align="flex-start">
          <Stat>
            <StatLabel color="gray.500">{label}</StatLabel>
            <StatNumber fontSize="2xl">
              {loading ? <Skeleton height="30px" width="100px" /> : value}
            </StatNumber>
            <StatHelpText mb="0">
              {loading ? <Skeleton height="16px" width="160px" /> : helpText}
            </StatHelpText>
          </Stat>

          <Box
            p={3}
            borderRadius="lg"
            bg={`${accent.split(".")[0]}.50`}
            color={accent}
          >
            {icon}
          </Box>
        </HStack>
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

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

export default function TenantDashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [companies, setCompanies] = useState([]);
  const [productStats, setProductStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recentProducts: [],
  });
  const [customerStats, setCustomerStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recentCustomers: [],
  });
  const [invoiceStats, setInvoiceStats] = useState({
    total: 0,
    recentInvoices: [],
  });
  const [invoiceSequences, setInvoiceSequences] = useState([]);
  const [invoiceRows, setInvoiceRows] = useState([]);

  const loadDashboard = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [
        companiesData,
        productStatsData,
        customerStatsData,
        invoiceStatsData,
        invoiceSequenceData,
        invoicePageData,
      ] = await Promise.all([
        getMyCompanies(),
        getProductStats(),
        getCustomerStats(),
        getInvoiceStats(),
        getInvoiceSequences(),
        getInvoicesPage({ page: 0, size: 10 }),
      ]);

      const nextCompanies = companiesData || [];

      setCompanies(nextCompanies);
      dispatch(setCompanyList({ companies: nextCompanies }));

      setProductStats(
        productStatsData || {
          total: 0,
          active: 0,
          inactive: 0,
          recentProducts: [],
        },
      );
      setCustomerStats(
        customerStatsData || {
          total: 0,
          active: 0,
          inactive: 0,
          recentCustomers: [],
        },
      );
      setInvoiceStats(
        invoiceStatsData || {
          total: 0,
          recentInvoices: [],
        },
      );
      setInvoiceSequences(invoiceSequenceData || []);
      setInvoiceRows(invoicePageData?.content || []);
    } catch (error) {
      toast({
        title: "Failed to load dashboard",
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
    loadDashboard();
  }, []);

  const activeSequenceCount = useMemo(() => {
    return invoiceSequences.filter((item) => item.active).length;
  }, [invoiceSequences]);

  const totalInvoiceValue = useMemo(() => {
    return invoiceRows.reduce(
      (sum, invoice) => sum + Number(invoice.totalInvoiceAmount || 0),
      0,
    );
  }, [invoiceRows]);

  const issuedInvoiceCount = useMemo(() => {
    return invoiceRows.filter((invoice) => invoice.status === "ISSUED").length;
  }, [invoiceRows]);

  const recentInvoices = useMemo(() => {
    return invoiceStats.recentInvoices || [];
  }, [invoiceStats]);

  return (
    <Stack spacing={6}>
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Box>
          <Heading size="lg">Tenant Dashboard</Heading>
          <Text color="gray.500" mt={1}>
            Track companies, products, customers, invoice sequences, and
            invoices for the active tenant.
          </Text>
        </Box>

        <Button
          leftIcon={<RefreshCw size={16} />}
          variant="outline"
          onClick={() => loadDashboard({ silent: true })}
          isLoading={refreshing}
        >
          Refresh
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
        <MetricCard
          label="Companies"
          value={companies.length}
          helpText="Tenant-linked companies"
          icon={<Building2 size={20} />}
          loading={loading}
          accent="purple.500"
        />
        <MetricCard
          label="Products"
          value={productStats.total}
          helpText={`${productStats.active || 0} active product(s)`}
          icon={<Package size={20} />}
          loading={loading}
          accent="blue.500"
        />
        <MetricCard
          label="Customers"
          value={customerStats.total}
          helpText={`${customerStats.active || 0} active customer(s)`}
          icon={<Users size={20} />}
          loading={loading}
          accent="green.500"
        />
        <MetricCard
          label="Invoice Sequences"
          value={invoiceSequences.length}
          helpText={`${activeSequenceCount} active sequence(s)`}
          icon={<Hash size={20} />}
          loading={loading}
          accent="orange.500"
        />
        <MetricCard
          label="Invoices"
          value={invoiceStats.total}
          helpText={`${issuedInvoiceCount} issued invoice(s)`}
          icon={<FileText size={20} />}
          loading={loading}
          accent="teal.500"
        />
        <MetricCard
          label="Recent Invoice Value"
          value={formatCurrency(totalInvoiceValue)}
          helpText="Based on latest loaded invoices"
          icon={<FileText size={20} />}
          loading={loading}
          accent="pink.500"
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={6}>
        <GridItem>
          <Card
            borderWidth="1px"
            borderColor="gray.200"
            shadow="sm"
            borderRadius="xl"
          >
            <CardBody>
              <Flex justify="space-between" align="center" mb={4}>
                <Box>
                  <Heading size="md">Recent Invoices</Heading>
                  <Text color="gray.500" fontSize="sm" mt={1}>
                    Latest invoice activity for the selected company context
                  </Text>
                </Box>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/invoices")}
                >
                  View All
                </Button>
              </Flex>

              <Box overflowX="auto">
                {loading ? (
                  <Stack spacing={3}>
                    <Skeleton height="52px" />
                    <Skeleton height="52px" />
                    <Skeleton height="52px" />
                    <Skeleton height="52px" />
                  </Stack>
                ) : recentInvoices.length === 0 ? (
                  <Box py={8} textAlign="center">
                    <FileText size={26} style={{ margin: "0 auto" }} />
                    <Text fontWeight="600" mt={3}>
                      No recent invoices
                    </Text>
                    <Text color="gray.500" mt={1}>
                      Create your first invoice to see activity here.
                    </Text>
                  </Box>
                ) : (
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr>
                        <Th>Invoice No</Th>
                        <Th>Date</Th>
                        <Th>Customer</Th>
                        <Th isNumeric>Total</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {recentInvoices.map((invoice) => (
                        <Tr
                          key={invoice.id}
                          cursor="pointer"
                          _hover={{ bg: "gray.50" }}
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                        >
                          <Td>
                            <Text fontWeight="700">{invoice.invoiceNo}</Text>
                          </Td>
                          <Td>{formatDate(invoice.invoiceDate)}</Td>
                          <Td>{invoice.customerLegalName || "—"}</Td>
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
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Stack spacing={6}>
            <Card
              borderWidth="1px"
              borderColor="gray.200"
              shadow="sm"
              borderRadius="xl"
            >
              <CardBody>
                <Heading size="md" mb={4}>
                  Quick Actions
                </Heading>

                <Stack spacing={3}>
                  <Button
                    onClick={() => navigate("/invoices/new")}
                    colorScheme="blue"
                  >
                    Create Invoice
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/customers")}
                  >
                    Manage Customers
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/products")}
                  >
                    Manage Products
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/invoice-sequences")}
                  >
                    Manage Invoice Sequences
                  </Button>
                </Stack>
              </CardBody>
            </Card>

            <Card
              borderWidth="1px"
              borderColor="gray.200"
              shadow="sm"
              borderRadius="xl"
            >
              <CardBody>
                <Heading size="md" mb={4}>
                  Snapshot
                </Heading>

                <Stack spacing={4}>
                  <Flex justify="space-between">
                    <Text color="gray.500">Active Products</Text>
                    <Text fontWeight="700">{productStats.active || 0}</Text>
                  </Flex>

                  <Flex justify="space-between">
                    <Text color="gray.500">Active Customers</Text>
                    <Text fontWeight="700">{customerStats.active || 0}</Text>
                  </Flex>

                  <Flex justify="space-between">
                    <Text color="gray.500">Inactive Customers</Text>
                    <Text fontWeight="700">{customerStats.inactive || 0}</Text>
                  </Flex>

                  <Flex justify="space-between">
                    <Text color="gray.500">Invoice Sequences</Text>
                    <Text fontWeight="700">{invoiceSequences.length}</Text>
                  </Flex>

                  <Flex justify="space-between">
                    <Text color="gray.500">Recent Invoice Value</Text>
                    <Text fontWeight="700">
                      {formatCurrency(totalInvoiceValue)}
                    </Text>
                  </Flex>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </GridItem>
      </Grid>
    </Stack>
  );
}
