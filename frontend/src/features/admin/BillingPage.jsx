import React, { useMemo, useState } from "react";
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

const DUMMY_BILLING = {
  summary: {
    totalTenants: 20,
    activeSubscriptions: 18,
    overdueTenants: 2,
    suspendedTenants: 1,
    mrr: 184500,
    arr: 2214000,
    billedThisMonth: 216450,
    collectedThisMonth: 198620,
    outstandingAmount: 17830,
    gstCollectedThisMonth: 35751.6,
  },
  plans: [
    { name: "Starter", tenants: 7, mrr: 35000, color: "gray" },
    { name: "Growth", tenants: 6, mrr: 54000, color: "blue" },
    { name: "Business", tenants: 5, mrr: 62500, color: "purple" },
    { name: "Enterprise", tenants: 2, mrr: 33000, color: "green" },
  ],
  recentInvoices: [
    {
      invoiceNo: "SAS-INV-2026-101",
      tenantId: 20,
      tenantName: "Demo Tenant 20",
      amount: 12980,
      gstAmount: 2336.4,
      issuedOn: "2026-05-18",
      dueOn: "2026-05-25",
      status: "PAID",
    },
    {
      invoiceNo: "SAS-INV-2026-100",
      tenantId: 19,
      tenantName: "Demo Tenant 19",
      amount: 5900,
      gstAmount: 1062,
      issuedOn: "2026-05-17",
      dueOn: "2026-05-24",
      status: "PENDING",
    },
    {
      invoiceNo: "SAS-INV-2026-099",
      tenantId: 18,
      tenantName: "Demo Tenant 18",
      amount: 8850,
      gstAmount: 1593,
      issuedOn: "2026-05-16",
      dueOn: "2026-05-21",
      status: "OVERDUE",
    },
    {
      invoiceNo: "SAS-INV-2026-098",
      tenantId: 17,
      tenantName: "Demo Tenant 17",
      amount: 17700,
      gstAmount: 3186,
      issuedOn: "2026-05-15",
      dueOn: "2026-05-22",
      status: "PAID",
    },
  ],
  tenants: [
    {
      tenantId: 20,
      tenantName: "Demo Tenant 20",
      gstin: "30ABCDE0020F3Z5",
      contactEmail: "demo20@company.com",
      plan: "Enterprise",
      billingCycle: "MONTHLY",
      subscriptionStatus: "ACTIVE",
      paymentStatus: "PAID",
      mrr: 16500,
      arr: 198000,
      billedThisCycle: 19470,
      outstanding: 0,
      gstRate: 18,
      companies: 1,
      users: 1,
      lastPaymentDate: "2026-05-18",
      nextRenewalDate: "2026-06-18",
    },
    {
      tenantId: 19,
      tenantName: "Demo Tenant 19",
      gstin: "29ABCDE0019F2Z5",
      contactEmail: "demo19@company.com",
      plan: "Growth",
      billingCycle: "MONTHLY",
      subscriptionStatus: "ACTIVE",
      paymentStatus: "PENDING",
      mrr: 5000,
      arr: 60000,
      billedThisCycle: 5900,
      outstanding: 5900,
      gstRate: 18,
      companies: 1,
      users: 1,
      lastPaymentDate: "2026-04-18",
      nextRenewalDate: "2026-05-24",
    },
    {
      tenantId: 18,
      tenantName: "Demo Tenant 18",
      gstin: "28ABCDE0018F1Z5",
      contactEmail: "demo18@company.com",
      plan: "Business",
      billingCycle: "MONTHLY",
      subscriptionStatus: "ACTIVE",
      paymentStatus: "OVERDUE",
      mrr: 7500,
      arr: 90000,
      billedThisCycle: 8850,
      outstanding: 8850,
      gstRate: 18,
      companies: 1,
      users: 1,
      lastPaymentDate: "2026-04-12",
      nextRenewalDate: "2026-05-21",
    },
    {
      tenantId: 17,
      tenantName: "Demo Tenant 17",
      gstin: "27ABCDE0017F9Z5",
      contactEmail: "demo17@company.com",
      plan: "Business",
      billingCycle: "ANNUAL",
      subscriptionStatus: "ACTIVE",
      paymentStatus: "PAID",
      mrr: 12000,
      arr: 144000,
      billedThisCycle: 169920,
      outstanding: 0,
      gstRate: 18,
      companies: 1,
      users: 1,
      lastPaymentDate: "2026-05-15",
      nextRenewalDate: "2027-05-15",
    },
    {
      tenantId: 16,
      tenantName: "Demo Tenant 16",
      gstin: "26ABCDE0016F8Z5",
      contactEmail: "demo16@company.com",
      plan: "Starter",
      billingCycle: "MONTHLY",
      subscriptionStatus: "SUSPENDED",
      paymentStatus: "UNPAID",
      mrr: 2500,
      arr: 30000,
      billedThisCycle: 2950,
      outstanding: 2950,
      gstRate: 18,
      companies: 1,
      users: 1,
      lastPaymentDate: "2026-03-10",
      nextRenewalDate: "2026-05-10",
    },
  ],
};

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function getStatusColor(status) {
  const normalized = String(status || "").toUpperCase();

  if (["ACTIVE", "PAID"].includes(normalized)) return "green";
  if (["PENDING"].includes(normalized)) return "orange";
  if (["OVERDUE", "UNPAID"].includes(normalized)) return "red";
  if (["SUSPENDED"].includes(normalized)) return "purple";
  if (["TRIAL"].includes(normalized)) return "blue";

  return "gray";
}

function MetricCard({ label, value, helpText, icon, color = "blue.500" }) {
  return (
    <Card
      borderWidth="1px"
      borderColor="gray.200"
      shadow="sm"
      borderRadius="xl"
    >
      <CardBody>
        <Flex justify="space-between" align="flex-start" gap={4}>
          <Stat>
            <StatLabel color="gray.500">{label}</StatLabel>
            <StatNumber fontSize="2xl">{value}</StatNumber>
            <StatHelpText mb="0">{helpText}</StatHelpText>
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
    <Card
      borderWidth="1px"
      borderColor="gray.200"
      shadow="sm"
      borderRadius="xl"
    >
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
  const [period, setPeriod] = useState("this-month");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");

  const billing = DUMMY_BILLING;

  const filteredTenants = useMemo(() => {
    return billing.tenants.filter((tenant) => {
      const matchesQuery =
        !query ||
        tenant.tenantName.toLowerCase().includes(query.toLowerCase()) ||
        tenant.contactEmail.toLowerCase().includes(query.toLowerCase()) ||
        tenant.gstin.toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        !status ||
        tenant.subscriptionStatus === status ||
        tenant.paymentStatus === status;

      const matchesPlan = !plan || tenant.plan === plan;

      return matchesQuery && matchesStatus && matchesPlan;
    });
  }, [billing.tenants, query, status, plan]);

  const collectionRatio = useMemo(() => {
    const collected = billing.summary.collectedThisMonth || 0;
    const billed = billing.summary.billedThisMonth || 0;
    if (!billed) return 0;
    return Math.round((collected / billed) * 100);
  }, [billing]);

  const activeRatio = useMemo(() => {
    const total = billing.summary.totalTenants || 0;
    const active = billing.summary.activeSubscriptions || 0;
    if (!total) return 0;
    return Math.round((active / total) * 100);
  }, [billing]);

  const overdueRatio = useMemo(() => {
    const total = billing.summary.totalTenants || 0;
    const overdue = billing.summary.overdueTenants || 0;
    if (!total) return 0;
    return Math.round((overdue / total) * 100);
  }, [billing]);

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
            Manage subscription billing, GST invoices, renewals, collections,
            and payment health across all tenants.
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

          <Button leftIcon={<RefreshCw size={16} />} variant="outline">
            Refresh
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing={4}>
        <MetricCard
          label="Monthly Recurring Revenue"
          value={formatINR(billing.summary.mrr)}
          helpText={`ARR: ${formatINR(billing.summary.arr)}`}
          icon={TrendingUp}
          color="green.500"
        />
        <MetricCard
          label="Active Subscriptions"
          value={billing.summary.activeSubscriptions}
          helpText={`Out of ${billing.summary.totalTenants} total tenants`}
          icon={Users}
          color="blue.500"
        />
        <MetricCard
          label="Billed This Month"
          value={formatINR(billing.summary.billedThisMonth)}
          helpText={`Collected: ${formatINR(billing.summary.collectedThisMonth)}`}
          icon={CreditCard}
          color="purple.500"
        />
        <MetricCard
          label="Outstanding Amount"
          value={formatINR(billing.summary.outstandingAmount)}
          helpText={`Overdue tenants: ${billing.summary.overdueTenants}`}
          icon={AlertTriangle}
          color="red.500"
        />
        <MetricCard
          label="GST Collected"
          value={formatINR(billing.summary.gstCollectedThisMonth)}
          helpText="SaaS subscription tax collection"
          icon={ShieldCheck}
          color="orange.500"
        />
        <MetricCard
          label="Suspended Tenants"
          value={billing.summary.suspendedTenants}
          helpText="Tenants impacted by billing status"
          icon={Building2}
          color="gray.500"
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", xl: "1.35fr 1fr" }} gap={6}>
        <GridItem>
          <SectionCard
            title="Subscription Health"
            subtitle={`Tenant billing health snapshot for ${period.replaceAll("-", " ")}`}
            rightAction={
              <Badge colorScheme="green">Dummy Tenant Billing Data</Badge>
            }
          >
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
                  value={billing.summary.activeSubscriptions}
                  tone="green"
                />
                <InsightRow
                  label="Overdue tenants"
                  value={billing.summary.overdueTenants}
                  tone="red"
                />
                <InsightRow
                  label="Suspended tenants"
                  value={billing.summary.suspendedTenants}
                  tone="purple"
                />
                <InsightRow
                  label="Outstanding balance"
                  value={formatINR(billing.summary.outstandingAmount)}
                  tone="orange"
                />
              </Stack>
            </Stack>
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard
            title="Plan Distribution"
            subtitle="MRR split by tenant subscription plan"
            rightAction={
              <Icon as={BadgeIndianRupee} color="purple.500" boxSize={5} />
            }
          >
            <Stack spacing={5}>
              {billing.plans.map((planItem) => {
                const pct = Math.round(
                  (planItem.mrr / billing.summary.mrr) * 100,
                );

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
                    <Progress
                      value={pct}
                      colorScheme={planItem.color}
                      borderRadius="full"
                    />
                  </Box>
                );
              })}
            </Stack>
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
              </Select>
            </GridItem>

            <GridItem>
              <Select
                placeholder="Filter by plan"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
              >
                <option value="Starter">Starter</option>
                <option value="Growth">Growth</option>
                <option value="Business">Business</option>
                <option value="Enterprise">Enterprise</option>
              </Select>
            </GridItem>
          </Grid>
        </Stack>

        <Box overflowX="auto">
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
                        {tenant.contactEmail}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        GSTIN: {tenant.gstin}
                      </Text>
                    </Box>
                  </Td>
                  <Td>
                    <Box>
                      <Badge colorScheme="blue">{tenant.plan}</Badge>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        {tenant.billingCycle}
                      </Text>
                    </Box>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={getStatusColor(tenant.subscriptionStatus)}
                    >
                      {tenant.subscriptionStatus}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(tenant.paymentStatus)}>
                      {tenant.paymentStatus}
                    </Badge>
                  </Td>
                  <Td isNumeric>{formatINR(tenant.mrr)}</Td>
                  <Td isNumeric>
                    <Box>
                      <Text>{formatINR(tenant.billedThisCycle)}</Text>
                      <Text fontSize="xs" color="gray.500">
                        GST {tenant.gstRate}%
                      </Text>
                    </Box>
                  </Td>
                  <Td isNumeric>
                    <Text
                      color={tenant.outstanding > 0 ? "red.500" : "inherit"}
                    >
                      {formatINR(tenant.outstanding)}
                    </Text>
                  </Td>
                  <Td>
                    <Box>
                      <Text>{tenant.nextRenewalDate}</Text>
                      <Text fontSize="xs" color="gray.500">
                        Last paid: {tenant.lastPaymentDate}
                      </Text>
                    </Box>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </SectionCard>

      <Grid templateColumns={{ base: "1fr", xl: "1.2fr 1fr" }} gap={6}>
        <GridItem>
          <SectionCard
            title="Recent Subscription Invoices"
            subtitle="Latest SaaS invoices issued to tenants"
            rightAction={<Icon as={FileText} color="orange.500" boxSize={5} />}
          >
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
                {billing.recentInvoices.map((invoice) => (
                  <Tr key={invoice.invoiceNo}>
                    <Td>
                      <Box>
                        <Text fontWeight="600">{invoice.invoiceNo}</Text>
                        <Text fontSize="xs" color="gray.500">
                          Issued {invoice.issuedOn}
                        </Text>
                      </Box>
                    </Td>
                    <Td>
                      <Box>
                        <Text>{invoice.tenantName}</Text>
                        <Text fontSize="xs" color="gray.500">
                          Tenant #{invoice.tenantId}
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
                    <Td>{invoice.dueOn}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard
            title="Renewal Watchlist"
            subtitle="Tenants requiring close billing attention"
            rightAction={
              <Icon as={CalendarClock} color="red.500" boxSize={5} />
            }
          >
            <Stack spacing={4}>
              {billing.tenants
                .filter(
                  (tenant) =>
                    tenant.paymentStatus === "OVERDUE" ||
                    tenant.paymentStatus === "PENDING" ||
                    tenant.subscriptionStatus === "SUSPENDED",
                )
                .map((tenant) => (
                  <Box key={tenant.tenantId}>
                    <HStack spacing={2} mb={1} flexWrap="wrap">
                      <Text fontWeight="600">{tenant.tenantName}</Text>
                      <Badge
                        colorScheme={getStatusColor(tenant.subscriptionStatus)}
                      >
                        {tenant.subscriptionStatus}
                      </Badge>
                      <Badge colorScheme={getStatusColor(tenant.paymentStatus)}>
                        {tenant.paymentStatus}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      Renewal: {tenant.nextRenewalDate} • Outstanding:{" "}
                      {formatINR(tenant.outstanding)}
                    </Text>
                  </Box>
                ))}
            </Stack>
          </SectionCard>
        </GridItem>
      </Grid>
    </Stack>
  );
}
