import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Input,
  Progress,
  Select,
  SimpleGrid,
  Skeleton,
  Spinner,
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
  AlertTriangle,
  BadgeIndianRupee,
  Building2,
  CalendarClock,
  CreditCard,
  FileText,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import api from "../../services/api";

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function getStatusColor(status) {
  const normalized = String(status || "").toUpperCase();

  if (["ACTIVE", "PAID"].includes(normalized)) return "green";
  if (["PENDING"].includes(normalized)) return "orange";
  if (["OVERDUE", "UNPAID", "PAST_DUE", "FAILED"].includes(normalized)) return "red";
  if (["SUSPENDED"].includes(normalized)) return "purple";
  if (["TRIAL"].includes(normalized)) return "blue";
  if (["DRAFT", "ISSUED", "CANCELLED", "VOID"].includes(normalized)) return "gray";

  return "gray";
}

function MetricCard({
  label,
  value,
  helpText,
  icon,
  color = "blue.500",
  loading = false,
}) {
  return (
    <Card borderWidth="1px" borderColor="gray.200" shadow="sm" borderRadius="xl">
      <CardBody>
        <Flex justify="space-between" align="flex-start" gap={4}>
          <Stat>
            <StatLabel color="gray.500">{label}</StatLabel>
            <StatNumber fontSize="2xl">
              {loading ? <Skeleton height="30px" width="120px" /> : value}
            </StatNumber>
            <StatHelpText mb="0">
              {loading ? <Skeleton height="16px" width="170px" /> : helpText}
            </StatHelpText>
          </Stat>

          <Flex
            align="center"
            justify="center"
            boxSize="48px"
            borderRadius="xl"
            bg="gray.50"
            color={color}
          >
            <Icon as={icon} boxSize={5} />
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
}

function SectionCard({ title, subtitle, rightAction, children }) {
  return (
    <Card borderWidth="1px" borderColor="gray.200" shadow="sm" borderRadius="xl">
      <CardBody>
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={3}
          mb={5}
        >
          <Box>
            <Heading size="md">{title}</Heading>
            {subtitle ? (
              <Text mt={1} color="gray.500" fontSize="sm">
                {subtitle}
              </Text>
            ) : null}
          </Box>
          {rightAction}
        </Flex>
        {children}
      </CardBody>
    </Card>
  );
}

function InsightRow({ label, value, tone = "gray" }) {
  return (
    <Flex justify="space-between" align="center" gap={4}>
      <Text color="gray.600">{label}</Text>
      <Badge colorScheme={tone} variant="subtle" px={2} py={1}>
        {value}
      </Badge>
    </Flex>
  );
}

export default function BillingPage() {
  const toast = useToast();

  const [period, setPeriod] = useState("this-month");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [billing, setBilling] = useState({
    summary: null,
    plans: [],
    recentInvoices: [],
    tenants: [],
    renewalWatchlist: [],
  });

  const fetchBillingOverview = async ({ silent = false, nextPeriod = period } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await api.get("/api/platform/billing/overview", {
        params: { period: nextPeriod },
      });

      setBilling({
        summary: res.data?.summary || null,
        plans: res.data?.plans || [],
        recentInvoices: res.data?.recentInvoices || [],
        tenants: res.data?.tenants || [],
        renewalWatchlist: res.data?.renewalWatchlist || [],
      });
    } catch (error) {
      toast({
        title: "Failed to load billing overview",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

      setBilling({
        summary: null,
        plans: [],
        recentInvoices: [],
        tenants: [],
        renewalWatchlist: [],
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
    fetchBillingOverview({ nextPeriod: period });
  }, [period]);

  const summary = billing.summary || {};

  const filteredTenants = useMemo(() => {
    return (billing.tenants || []).filter((tenant) => {
      const matchesQuery =
        !query ||
        String(tenant.tenantName || "").toLowerCase().includes(query.toLowerCase()) ||
        String(tenant.contactEmail || "").toLowerCase().includes(query.toLowerCase()) ||
        String(tenant.gstin || "").toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        !status ||
        tenant.subscriptionStatus === status ||
        tenant.paymentStatus === status;

      const matchesPlan = !plan || tenant.plan === plan;

      return matchesQuery && matchesStatus && matchesPlan;
    });
  }, [billing.tenants, query, status, plan]);

  const collectionRatio = useMemo(() => {
    const collected = Number(summary.collectedThisMonth || 0);
    const billed = Number(summary.billedThisMonth || 0);
    if (!billed) return 0;
    return Math.round((collected / billed) * 100);
  }, [summary]);

  const activeRatio = useMemo(() => {
    const total = Number(summary.totalTenants || 0);
    const active = Number(summary.activeSubscriptions || 0);
    if (!total) return 0;
    return Math.round((active / total) * 100);
  }, [summary]);

  const overdueRatio = useMemo(() => {
    const total = Number(summary.totalTenants || 0);
    const overdue = Number(summary.overdueTenants || 0);
    if (!total) return 0;
    return Math.round((overdue / total) * 100);
  }, [summary]);

  return (
    <Stack spacing={6}>
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Box>
          <Heading size="lg">Tenant Billing</Heading>
          <Text color="gray.500" mt={1}>
            Manage subscription billing, GST invoices, renewals, collections, and payment health across all tenants.
          </Text>
        </Box>

        <HStack spacing={3}>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            w="170px"
            borderRadius="lg"
          >
            <option value="today">Today</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="this-quarter">This Quarter</option>
            <option value="this-year">This Year</option>
          </Select>

          <Button
            leftIcon={<RefreshCw size={16} />}
            variant="outline"
            onClick={() => fetchBillingOverview({ silent: true, nextPeriod: period })}
            isLoading={refreshing}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing={4}>
        <MetricCard
          label="Monthly Recurring Revenue"
          value={formatINR(summary.mrr)}
          helpText={`ARR: ${formatINR(summary.arr)}`}
          icon={TrendingUp}
          color="green.500"
          loading={loading}
        />
        <MetricCard
          label="Active Subscriptions"
          value={summary.activeSubscriptions ?? "—"}
          helpText={`Out of ${summary.totalTenants ?? 0} total tenants`}
          icon={Users}
          color="blue.500"
          loading={loading}
        />
        <MetricCard
          label="Billed This Period"
          value={formatINR(summary.billedThisMonth)}
          helpText={`Collected: ${formatINR(summary.collectedThisMonth)}`}
          icon={CreditCard}
          color="purple.500"
          loading={loading}
        />
        <MetricCard
          label="Outstanding Amount"
          value={formatINR(summary.outstandingAmount)}
          helpText={`Overdue tenants: ${summary.overdueTenants ?? 0}`}
          icon={AlertTriangle}
          color="red.500"
          loading={loading}
        />
        <MetricCard
          label="GST Collected"
          value={formatINR(summary.gstCollectedThisMonth)}
          helpText="SaaS subscription tax collection"
          icon={ShieldCheck}
          color="orange.500"
          loading={loading}
        />
        <MetricCard
          label="Suspended Tenants"
          value={summary.suspendedTenants ?? "—"}
          helpText="Tenants impacted by billing status"
          icon={Building2}
          color="gray.500"
          loading={loading}
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", xl: "1.35fr 1fr" }} gap={6}>
        <GridItem>
          <SectionCard
            title="Subscription Health"
            subtitle={`Tenant billing health snapshot for ${period.replaceAll("-", " ")}`}
            rightAction={
              loading ? <Spinner size="sm" /> : <Badge colorScheme="green">Connected</Badge>
            }
          >
            {loading ? (
              <Stack spacing={4}>
                <Skeleton height="20px" />
                <Skeleton height="20px" />
                <Skeleton height="20px" />
                <Skeleton height="20px" />
              </Stack>
            ) : (
              <Stack spacing={5}>
                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.500">
                      Active subscription ratio
                    </Text>
                    <Text fontSize="sm" fontWeight="600">
                      {activeRatio}%
                    </Text>
                  </Flex>
                  <Progress
                    value={activeRatio}
                    colorScheme={activeRatio >= 85 ? "green" : "orange"}
                    borderRadius="full"
                  />
                </Box>

                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.500">
                      Collection ratio
                    </Text>
                    <Text fontSize="sm" fontWeight="600">
                      {collectionRatio}%
                    </Text>
                  </Flex>
                  <Progress
                    value={collectionRatio}
                    colorScheme={collectionRatio >= 85 ? "green" : "orange"}
                    borderRadius="full"
                  />
                </Box>

                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.500">
                      Overdue tenant ratio
                    </Text>
                    <Text fontSize="sm" fontWeight="600">
                      {overdueRatio}%
                    </Text>
                  </Flex>
                  <Progress
                    value={overdueRatio}
                    colorScheme={overdueRatio >= 10 ? "red" : "green"}
                    borderRadius="full"
                  />
                </Box>

                <Divider />

                <Stack spacing={3}>
                  <InsightRow
                    label="Active subscriptions"
                    value={summary.activeSubscriptions ?? 0}
                    tone="green"
                  />
                  <InsightRow
                    label="Overdue tenants"
                    value={summary.overdueTenants ?? 0}
                    tone="red"
                  />
                  <InsightRow
                    label="Suspended tenants"
                    value={summary.suspendedTenants ?? 0}
                    tone="purple"
                  />
                  <InsightRow
                    label="Outstanding balance"
                    value={formatINR(summary.outstandingAmount)}
                    tone="orange"
                  />
                </Stack>
              </Stack>
            )}
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard
            title="Plan Distribution"
            subtitle="MRR split by tenant subscription plan"
            rightAction={<Icon as={BadgeIndianRupee} color="purple.500" boxSize={5} />}
          >
            {loading ? (
              <Stack spacing={4}>
                <Skeleton height="48px" />
                <Skeleton height="48px" />
                <Skeleton height="48px" />
              </Stack>
            ) : (
              <Stack spacing={5}>
                {(billing.plans || []).map((planItem) => {
                  const mrr = Number(planItem.mrr || 0);
                  const totalMrr = Number(summary.mrr || 0);
                  const pct = totalMrr ? Math.round((mrr / totalMrr) * 100) : 0;

                  return (
                    <Box key={planItem.name}>
                      <Flex justify="space-between" mb={2} align="center">
                        <Box>
                          <Text fontWeight="600">{planItem.name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {planItem.tenants} tenants
                          </Text>
                        </Box>
                        <Text fontWeight="700">{formatINR(planItem.mrr)}</Text>
                      </Flex>
                      <Progress value={pct} colorScheme="blue" borderRadius="full" />
                    </Box>
                  );
                })}
              </Stack>
            )}
          </SectionCard>
        </GridItem>
      </Grid>

      <SectionCard
        title="Tenant Billing Directory"
        subtitle="Subscription plan, payment status, renewal timing, and billing amounts by tenant"
      >
        <Stack spacing={4} mb={5}>
          <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={3}>
            <GridItem>
              <Input
                placeholder="Search tenant, email, or GSTIN"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </GridItem>

            <GridItem>
              <Select
                placeholder="Filter by status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="OVERDUE">OVERDUE</option>
                <option value="UNPAID">UNPAID</option>
                <option value="PAST_DUE">PAST_DUE</option>
              </Select>
            </GridItem>

            <GridItem>
              <Select
                placeholder="Filter by plan"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
              >
                {(billing.plans || []).map((planItem) => (
                  <option key={planItem.name} value={planItem.name}>
                    {planItem.name}
                  </option>
                ))}
              </Select>
            </GridItem>
          </Grid>
        </Stack>

        <Box overflowX="auto">
          {loading ? (
            <Stack spacing={4}>
              <Skeleton height="56px" />
              <Skeleton height="56px" />
              <Skeleton height="56px" />
              <Skeleton height="56px" />
            </Stack>
          ) : filteredTenants.length === 0 ? (
            <Box py={10} textAlign="center">
              <Text fontWeight="600">No tenant billing records found</Text>
              <Text mt={1} color="gray.500">
                Adjust filters or try a different search.
              </Text>
            </Box>
          ) : (
            <Table variant="simple" size="md">
              <Thead>
                <Tr>
                  <Th>Tenant</Th>
                  <Th>Plan</Th>
                  <Th>Subscription</Th>
                  <Th>Payment</Th>
                  <Th isNumeric>MRR</Th>
                  <Th isNumeric>Cycle Bill</Th>
                  <Th isNumeric>Outstanding</Th>
                  <Th>Renewal</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredTenants.map((tenant) => (
                  <Tr key={tenant.tenantId}>
                    <Td>
                      <Box>
                        <Text fontWeight="600">{tenant.tenantName}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {tenant.contactEmail || "—"}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          GSTIN: {tenant.gstin || "—"}
                        </Text>
                      </Box>
                    </Td>
                    <Td>
                      <Box>
                        <Badge colorScheme="blue">{tenant.plan || "—"}</Badge>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {tenant.billingCycle || "—"}
                        </Text>
                      </Box>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(tenant.subscriptionStatus)}>
                        {tenant.subscriptionStatus || "—"}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(tenant.paymentStatus)}>
                        {tenant.paymentStatus || "—"}
                      </Badge>
                    </Td>
                    <Td isNumeric>{formatINR(tenant.mrr)}</Td>
                    <Td isNumeric>
                      <Box>
                        <Text>{formatINR(tenant.billedThisCycle)}</Text>
                        <Text fontSize="xs" color="gray.500">
                          GST {tenant.gstRate ?? "—"}%
                        </Text>
                      </Box>
                    </Td>
                    <Td isNumeric>
                      <Text color={Number(tenant.outstanding || 0) > 0 ? "red.500" : "inherit"}>
                        {formatINR(tenant.outstanding)}
                      </Text>
                    </Td>
                    <Td>
                      <Box>
                        <Text>{tenant.nextRenewalDate || "—"}</Text>
                        <Text fontSize="xs" color="gray.500">
                          Last paid: {tenant.lastPaymentDate || "—"}
                        </Text>
                      </Box>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </SectionCard>

      <Grid templateColumns={{ base: "1fr", xl: "1.2fr 1fr" }} gap={6}>
        <GridItem>
          <SectionCard
            title="Recent Subscription Invoices"
            subtitle="Latest SaaS invoices issued to tenants"
            rightAction={<Icon as={FileText} color="orange.500" boxSize={5} />}
          >
            {loading ? (
              <Stack spacing={4}>
                <Skeleton height="48px" />
                <Skeleton height="48px" />
                <Skeleton height="48px" />
              </Stack>
            ) : (billing.recentInvoices || []).length === 0 ? (
              <Text color="gray.500">No recent invoices available.</Text>
            ) : (
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Invoice</Th>
                    <Th>Tenant</Th>
                    <Th isNumeric>Amount</Th>
                    <Th>Due</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(billing.recentInvoices || []).map((invoice) => (
                    <Tr key={invoice.invoiceNo}>
                      <Td>
                        <Box>
                          <Text fontWeight="600">{invoice.invoiceNo}</Text>
                          <Text fontSize="xs" color="gray.500">
                            Issued {invoice.issuedOn || "—"}
                          </Text>
                        </Box>
                      </Td>
                      <Td>
                        <Box>
                          <Text>{invoice.tenantName || "—"}</Text>
                          <Text fontSize="xs" color="gray.500">
                            Tenant #{invoice.tenantId ?? "—"}
                          </Text>
                        </Box>
                      </Td>
                      <Td isNumeric>
                        <Box>
                          <Text>{formatINR(invoice.amount)}</Text>
                          <Text fontSize="xs" color="gray.500">
                            GST {formatINR(invoice.gstAmount)}
                          </Text>
                        </Box>
                      </Td>
                      <Td>{invoice.dueOn || "—"}</Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(invoice.status)}>
                          {invoice.status || "—"}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard
            title="Renewal Watchlist"
            subtitle="Tenants requiring close billing attention"
            rightAction={<Icon as={CalendarClock} color="red.500" boxSize={5} />}
          >
            {loading ? (
              <Stack spacing={4}>
                <Skeleton height="44px" />
                <Skeleton height="44px" />
                <Skeleton height="44px" />
              </Stack>
            ) : (billing.renewalWatchlist || []).length === 0 ? (
              <Text color="gray.500">No watchlist items right now.</Text>
            ) : (
              <Stack spacing={4}>
                {(billing.renewalWatchlist || []).map((tenant) => (
                  <Box key={tenant.tenantId}>
                    <HStack spacing={2} mb={1} flexWrap="wrap">
                      <Text fontWeight="600">{tenant.tenantName || "—"}</Text>
                      <Badge colorScheme={getStatusColor(tenant.subscriptionStatus)}>
                        {tenant.subscriptionStatus || "—"}
                      </Badge>
                      <Badge colorScheme={getStatusColor(tenant.paymentStatus)}>
                        {tenant.paymentStatus || "—"}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      Renewal: {tenant.nextRenewalDate || "—"} • Outstanding:{" "}
                      {formatINR(tenant.outstanding)}
                    </Text>
                  </Box>
                ))}
              </Stack>
            )}
          </SectionCard>
        </GridItem>
      </Grid>
    </Stack>
  );
}