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
  ArrowUpRight,
  BadgeIndianRupee,
  Building2,
  FileText,
  Receipt,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Wallet,
  AlertTriangle,
} from "lucide-react";

const DUMMY_BILLING = {
  summary: {
    mrr: 248500,
    arr: 2982000,
    totalCollectedThisMonth: 412760,
    outstandingAmount: 86420,
    gstCollectedThisMonth: 74296.8,
    invoicesThisMonth: 186,
    paidInvoices: 154,
    overdueInvoices: 12,
    draftInvoices: 20,
  },
  gst: {
    cgst: 21460.4,
    sgst: 21460.4,
    igst: 31376.0,
    cess: 0,
  },
  plans: [
    { name: "Starter", customers: 42, mrr: 63000, growthPct: 8 },
    { name: "Growth", customers: 28, mrr: 98000, growthPct: 14 },
    { name: "Business", customers: 15, mrr: 67500, growthPct: 11 },
    { name: "Enterprise", customers: 4, mrr: 20000, growthPct: 5 },
  ],
  paymentModes: [
    { mode: "UPI", count: 72, amount: 112400 },
    { mode: "Bank Transfer", count: 38, amount: 146800 },
    { mode: "Card", count: 29, amount: 90860 },
    { mode: "Net Banking", count: 15, amount: 62700 },
  ],
  recentInvoices: [
    {
      id: "INV-2026-00192",
      customer: "Shree Ganesh Traders",
      gstin: "27ABCDE1234F1Z5",
      amount: 18450,
      gst: 3321,
      status: "PAID",
      dueDate: "2026-05-25",
      type: "B2B",
    },
    {
      id: "INV-2026-00191",
      customer: "Apex Retail Hub",
      gstin: "29PQRSX5678L1Z2",
      amount: 26800,
      gst: 4824,
      status: "OVERDUE",
      dueDate: "2026-05-14",
      type: "B2B",
    },
    {
      id: "INV-2026-00190",
      customer: "Metro Foods LLP",
      gstin: "07LMNOP4321C1Z8",
      amount: 12400,
      gst: 2232,
      status: "PENDING",
      dueDate: "2026-05-21",
      type: "B2B",
    },
    {
      id: "INV-2026-00189",
      customer: "BlueKart Services",
      gstin: "24AAACB1234M1Z9",
      amount: 9950,
      gst: 1791,
      status: "PAID",
      dueDate: "2026-05-20",
      type: "B2B",
    },
    {
      id: "INV-2026-00188",
      customer: "Walk-in Consumer",
      gstin: null,
      amount: 3150,
      gst: 567,
      status: "DRAFT",
      dueDate: "2026-05-28",
      type: "B2C",
    },
  ],
  topCustomers: [
    { name: "Apex Retail Hub", invoices: 18, billed: 214000, paidPct: 82 },
    { name: "Shree Ganesh Traders", invoices: 15, billed: 186500, paidPct: 96 },
    { name: "Metro Foods LLP", invoices: 13, billed: 144200, paidPct: 88 },
    { name: "BlueKart Services", invoices: 10, billed: 118900, paidPct: 91 },
  ],
};

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function getInvoiceStatusColor(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "PAID") return "green";
  if (normalized === "OVERDUE") return "red";
  if (normalized === "PENDING") return "orange";
  if (normalized === "DRAFT") return "gray";

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
  const [billing] = useState(DUMMY_BILLING);

  const paidRatio = useMemo(() => {
    const total = billing.summary.invoicesThisMonth || 0;
    const paid = billing.summary.paidInvoices || 0;
    if (!total) return 0;
    return Math.round((paid / total) * 100);
  }, [billing]);

  const overdueRatio = useMemo(() => {
    const total = billing.summary.invoicesThisMonth || 0;
    const overdue = billing.summary.overdueInvoices || 0;
    if (!total) return 0;
    return Math.round((overdue / total) * 100);
  }, [billing]);

  const collectionRatio = useMemo(() => {
    const collected = billing.summary.totalCollectedThisMonth || 0;
    const outstanding = billing.summary.outstandingAmount || 0;
    const gross = collected + outstanding;
    if (!gross) return 0;
    return Math.round((collected / gross) * 100);
  }, [billing]);

  const topPlanMrr = useMemo(() => {
    return [...billing.plans].sort((a, b) => b.mrr - a.mrr)[0];
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
          <Heading size="lg">Billing Overview</Heading>
          <Text color="gray.500" mt={1}>
            Revenue, GST, invoices, collections, and subscription billing
            insights for your India GST Billing SaaS platform.
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
          label="MRR"
          value={formatINR(billing.summary.mrr)}
          helpText={`ARR: ${formatINR(billing.summary.arr)}`}
          icon={TrendingUp}
          color="green.500"
        />
        <MetricCard
          label="Collected This Month"
          value={formatINR(billing.summary.totalCollectedThisMonth)}
          helpText={`Invoices this month: ${billing.summary.invoicesThisMonth}`}
          icon={Wallet}
          color="blue.500"
        />
        <MetricCard
          label="GST Collected"
          value={formatINR(billing.summary.gstCollectedThisMonth)}
          helpText="CGST + SGST + IGST + cess"
          icon={ShieldCheck}
          color="purple.500"
        />
        <MetricCard
          label="Outstanding Amount"
          value={formatINR(billing.summary.outstandingAmount)}
          helpText={`Overdue invoices: ${billing.summary.overdueInvoices}`}
          icon={AlertTriangle}
          color="red.500"
        />
        <MetricCard
          label="Paid Invoices"
          value={billing.summary.paidInvoices}
          helpText={`Draft: ${billing.summary.draftInvoices} • Pending/Overdue visible below`}
          icon={Receipt}
          color="teal.500"
        />
        <MetricCard
          label="Top Plan"
          value={topPlanMrr?.name || "—"}
          helpText={`MRR contribution: ${formatINR(topPlanMrr?.mrr || 0)}`}
          icon={Building2}
          color="orange.500"
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", xl: "1.35fr 1fr" }} gap={6}>
        <GridItem>
          <SectionCard
            title="Collections Health"
            subtitle={`Billing performance snapshot for ${period.replaceAll("-", " ")}`}
            rightAction={<Badge colorScheme="green">Dummy Billing Data</Badge>}
          >
            <Stack spacing={5}>
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
                <Text mt={2} fontSize="sm" color="gray.500">
                  Ratio of collected amount versus total collectible amount.
                </Text>
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">
                    Paid invoice ratio
                  </Text>
                  <Text fontSize="sm" fontWeight="600">
                    {paidRatio}%
                  </Text>
                </Flex>
                <Progress
                  value={paidRatio}
                  colorScheme={paidRatio >= 80 ? "green" : "orange"}
                  borderRadius="full"
                />
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">
                    Overdue pressure
                  </Text>
                  <Text fontSize="sm" fontWeight="600">
                    {overdueRatio}%
                  </Text>
                </Flex>
                <Progress
                  value={overdueRatio}
                  colorScheme={overdueRatio >= 15 ? "red" : "green"}
                  borderRadius="full"
                />
              </Box>

              <Divider />

              <Stack spacing={3}>
                <InsightRow
                  label="Paid invoices"
                  value={billing.summary.paidInvoices}
                  tone="green"
                />
                <InsightRow
                  label="Overdue invoices"
                  value={billing.summary.overdueInvoices}
                  tone="red"
                />
                <InsightRow
                  label="Draft invoices"
                  value={billing.summary.draftInvoices}
                  tone="gray"
                />
                <InsightRow
                  label="Invoices created"
                  value={billing.summary.invoicesThisMonth}
                  tone="blue"
                />
              </Stack>
            </Stack>
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard
            title="GST Breakdown"
            subtitle="Tax collected by component"
            rightAction={
              <Icon as={BadgeIndianRupee} color="purple.500" boxSize={5} />
            }
          >
            <Stack spacing={4}>
              <InsightRow
                label="CGST"
                value={formatINR(billing.gst.cgst)}
                tone="purple"
              />
              <InsightRow
                label="SGST"
                value={formatINR(billing.gst.sgst)}
                tone="purple"
              />
              <InsightRow
                label="IGST"
                value={formatINR(billing.gst.igst)}
                tone="blue"
              />
              <InsightRow
                label="Cess"
                value={formatINR(billing.gst.cess)}
                tone="gray"
              />

              <Divider />

              <Box>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Total GST collected
                </Text>
                <Text fontSize="2xl" fontWeight="700">
                  {formatINR(billing.summary.gstCollectedThisMonth)}
                </Text>
              </Box>
            </Stack>
          </SectionCard>
        </GridItem>
      </Grid>

      <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={6}>
        <GridItem>
          <SectionCard
            title="Plan Mix"
            subtitle="Subscription MRR split by product tier"
            rightAction={
              <Icon as={ArrowUpRight} color="green.500" boxSize={5} />
            }
          >
            <Stack spacing={5}>
              {billing.plans.map((plan) => {
                const pct = Math.round((plan.mrr / billing.summary.mrr) * 100);

                return (
                  <Box key={plan.name}>
                    <Flex justify="space-between" mb={2} align="center">
                      <Box>
                        <Text fontWeight="600">{plan.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {plan.customers} customers • Growth {plan.growthPct}%
                        </Text>
                      </Box>
                      <Text fontWeight="700">{formatINR(plan.mrr)}</Text>
                    </Flex>
                    <Progress
                      value={pct}
                      colorScheme="green"
                      borderRadius="full"
                    />
                  </Box>
                );
              })}
            </Stack>
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard
            title="Payment Modes"
            subtitle="Collection split by settlement channel"
            rightAction={<Icon as={Wallet} color="blue.500" boxSize={5} />}
          >
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Mode</Th>
                  <Th isNumeric>Payments</Th>
                  <Th isNumeric>Amount</Th>
                </Tr>
              </Thead>
              <Tbody>
                {billing.paymentModes.map((row) => (
                  <Tr key={row.mode}>
                    <Td>{row.mode}</Td>
                    <Td isNumeric>{row.count}</Td>
                    <Td isNumeric>{formatINR(row.amount)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </SectionCard>
        </GridItem>
      </Grid>

      <Grid templateColumns={{ base: "1fr", xl: "1.3fr 1fr" }} gap={6}>
        <GridItem>
          <SectionCard
            title="Recent Invoices"
            subtitle="Latest billing documents across customers"
            rightAction={<Icon as={FileText} color="orange.500" boxSize={5} />}
          >
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Invoice</Th>
                  <Th>Customer</Th>
                  <Th>Type</Th>
                  <Th isNumeric>Amount</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {billing.recentInvoices.map((invoice) => (
                  <Tr key={invoice.id}>
                    <Td>
                      <Box>
                        <Text fontWeight="600">{invoice.id}</Text>
                        <Text fontSize="xs" color="gray.500">
                          Due {invoice.dueDate}
                        </Text>
                      </Box>
                    </Td>
                    <Td>
                      <Box>
                        <Text>{invoice.customer}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {invoice.gstin || "No GSTIN"}
                        </Text>
                      </Box>
                    </Td>
                    <Td>{invoice.type}</Td>
                    <Td isNumeric>
                      <Box>
                        <Text>{formatINR(invoice.amount)}</Text>
                        <Text fontSize="xs" color="gray.500">
                          GST {formatINR(invoice.gst)}
                        </Text>
                      </Box>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getInvoiceStatusColor(invoice.status)}
                      >
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
            title="Top Customers"
            subtitle="Highest billed customers this cycle"
            rightAction={<Icon as={Building2} color="teal.500" boxSize={5} />}
          >
            <Stack spacing={5}>
              {billing.topCustomers.map((customer) => (
                <Box key={customer.name}>
                  <Flex justify="space-between" mb={2} align="center">
                    <Box>
                      <Text fontWeight="600">{customer.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {customer.invoices} invoices
                      </Text>
                    </Box>
                    <Text fontWeight="700">{formatINR(customer.billed)}</Text>
                  </Flex>

                  <Flex justify="space-between" mb={1}>
                    <Text fontSize="sm" color="gray.500">
                      Payment completion
                    </Text>
                    <Text fontSize="sm" fontWeight="600">
                      {customer.paidPct}%
                    </Text>
                  </Flex>
                  <Progress
                    value={customer.paidPct}
                    colorScheme={customer.paidPct >= 90 ? "green" : "orange"}
                    borderRadius="full"
                  />
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </GridItem>
      </Grid>
    </Stack>
  );
}
