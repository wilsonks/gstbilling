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
  Activity,
  Cpu,
  Database,
  HardDrive,
  RefreshCw,
  Server,
  Timer,
  Waves,
} from "lucide-react";

const DUMMY_METRICS = {
  system: {
    cpuUsagePct: 37,
    loadAverage1m: 1.42,
    uptimeHours: 186,
    diskUsedPct: 64,
    diskFreeGb: 142,
    processors: 8,
  },
  jvm: {
    heapUsedMb: 742,
    heapMaxMb: 2048,
    nonHeapUsedMb: 188,
    nonHeapMaxMb: 512,
    gcPauseMsP95: 84,
    classesLoaded: 18432,
  },
  threads: {
    live: 62,
    daemon: 48,
    peak: 79,
    states: {
      runnable: 12,
      waiting: 26,
      timedWaiting: 20,
      blocked: 4,
      new: 0,
      terminated: 0,
    },
  },
  http: {
    rps: 18.4,
    p50Ms: 42,
    p95Ms: 168,
    p99Ms: 412,
    errorRatePct: 0.8,
    activeRequests: 6,
    methods: [
      { method: "GET", count: 14820, pct: 62 },
      { method: "POST", count: 5720, pct: 24 },
      { method: "PUT", count: 1980, pct: 8 },
      { method: "DELETE", count: 620, pct: 3 },
      { method: "PATCH", count: 710, pct: 3 },
    ],
  },
  database: {
    active: 7,
    idle: 13,
    max: 25,
    min: 5,
    acquireMsP95: 22,
    usagePct: 28,
  },
};

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

function HealthBadge({ value, warning = 70, critical = 90, invert = false }) {
  let colorScheme = "green";

  if (!invert) {
    if (value >= critical) colorScheme = "red";
    else if (value >= warning) colorScheme = "orange";
  } else {
    if (value <= critical) colorScheme = "red";
    else if (value <= warning) colorScheme = "orange";
  }

  return <Badge colorScheme={colorScheme}>{value}%</Badge>;
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

export default function MetricsPage() {
  const [windowLabel, setWindowLabel] = useState("15m");
  const [metrics] = useState(DUMMY_METRICS);

  const heapPct = useMemo(() => {
    if (!metrics.jvm.heapMaxMb) return 0;
    return Math.round((metrics.jvm.heapUsedMb / metrics.jvm.heapMaxMb) * 100);
  }, [metrics]);

  const nonHeapPct = useMemo(() => {
    if (!metrics.jvm.nonHeapMaxMb) return 0;
    return Math.round(
      (metrics.jvm.nonHeapUsedMb / metrics.jvm.nonHeapMaxMb) * 100,
    );
  }, [metrics]);

  const dbPoolPct = useMemo(() => {
    if (!metrics.database.max) return 0;
    return Math.round((metrics.database.active / metrics.database.max) * 100);
  }, [metrics]);

  return (
    <Stack spacing={6}>
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Box>
          <Heading size="lg">Platform Metrics</Heading>
          <Text color="gray.500" mt={1}>
            Prometheus-style operational telemetry for system, JVM, HTTP,
            threads, and database pool health.
          </Text>
        </Box>

        <HStack spacing={3}>
          <Select
            value={windowLabel}
            onChange={(e) => setWindowLabel(e.target.value)}
            w="120px"
            borderRadius="lg"
          >
            <option value="5m">Last 5m</option>
            <option value="15m">Last 15m</option>
            <option value="1h">Last 1h</option>
            <option value="24h">Last 24h</option>
          </Select>

          <Button leftIcon={<RefreshCw size={16} />} variant="outline">
            Refresh
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing={4}>
        <MetricCard
          label="System CPU"
          value={`${metrics.system.cpuUsagePct}%`}
          helpText={`Load avg (1m): ${metrics.system.loadAverage1m}`}
          icon={Cpu}
          color="purple.500"
        />
        <MetricCard
          label="Heap Usage"
          value={`${metrics.jvm.heapUsedMb} MB`}
          helpText={`Max heap: ${metrics.jvm.heapMaxMb} MB`}
          icon={HardDrive}
          color="blue.500"
        />
        <MetricCard
          label="Live Threads"
          value={metrics.threads.live}
          helpText={`Peak: ${metrics.threads.peak} • Daemon: ${metrics.threads.daemon}`}
          icon={Waves}
          color="teal.500"
        />
        <MetricCard
          label="HTTP Throughput"
          value={`${metrics.http.rps} rps`}
          helpText={`p95: ${metrics.http.p95Ms} ms`}
          icon={Activity}
          color="orange.500"
        />
        <MetricCard
          label="DB Connections"
          value={`${metrics.database.active}/${metrics.database.max}`}
          helpText={`Idle: ${metrics.database.idle} • p95 acquire: ${metrics.database.acquireMsP95} ms`}
          icon={Database}
          color="red.500"
        />
        <MetricCard
          label="Uptime"
          value={`${metrics.system.uptimeHours} h`}
          helpText={`${metrics.system.processors} processors available`}
          icon={Server}
          color="cyan.500"
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", xl: "1.4fr 1fr" }} gap={6}>
        <GridItem>
          <SectionCard
            title="Resource Health"
            subtitle={`Computed summary over ${windowLabel}`}
            rightAction={
              <Badge colorScheme="green">Dummy Prometheus Data</Badge>
            }
          >
            <Stack spacing={5}>
              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">
                    CPU usage
                  </Text>
                  <HStack>
                    <Text fontSize="sm" fontWeight="600">
                      {metrics.system.cpuUsagePct}%
                    </Text>
                    <HealthBadge value={metrics.system.cpuUsagePct} />
                  </HStack>
                </Flex>
                <Progress
                  value={metrics.system.cpuUsagePct}
                  colorScheme={
                    metrics.system.cpuUsagePct >= 80 ? "red" : "purple"
                  }
                  borderRadius="full"
                />
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">
                    Heap memory
                  </Text>
                  <HStack>
                    <Text fontSize="sm" fontWeight="600">
                      {heapPct}%
                    </Text>
                    <HealthBadge value={heapPct} />
                  </HStack>
                </Flex>
                <Progress
                  value={heapPct}
                  colorScheme={heapPct >= 80 ? "red" : "blue"}
                  borderRadius="full"
                />
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">
                    Non-heap memory
                  </Text>
                  <HStack>
                    <Text fontSize="sm" fontWeight="600">
                      {nonHeapPct}%
                    </Text>
                    <HealthBadge
                      value={nonHeapPct}
                      warning={75}
                      critical={90}
                    />
                  </HStack>
                </Flex>
                <Progress
                  value={nonHeapPct}
                  colorScheme={nonHeapPct >= 85 ? "red" : "teal"}
                  borderRadius="full"
                />
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">
                    Database pool utilization
                  </Text>
                  <HStack>
                    <Text fontSize="sm" fontWeight="600">
                      {dbPoolPct}%
                    </Text>
                    <HealthBadge value={dbPoolPct} warning={70} critical={90} />
                  </HStack>
                </Flex>
                <Progress
                  value={dbPoolPct}
                  colorScheme={dbPoolPct >= 80 ? "red" : "orange"}
                  borderRadius="full"
                />
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">
                    Disk usage
                  </Text>
                  <HStack>
                    <Text fontSize="sm" fontWeight="600">
                      {metrics.system.diskUsedPct}%
                    </Text>
                    <HealthBadge value={metrics.system.diskUsedPct} />
                  </HStack>
                </Flex>
                <Progress
                  value={metrics.system.diskUsedPct}
                  colorScheme={
                    metrics.system.diskUsedPct >= 85 ? "red" : "cyan"
                  }
                  borderRadius="full"
                />
              </Box>
            </Stack>
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard title="Key Signals" subtitle="Instant overview">
            <Stack spacing={3}>
              <InsightRow
                label="GC pause p95"
                value={`${metrics.jvm.gcPauseMsP95} ms`}
                tone={metrics.jvm.gcPauseMsP95 > 150 ? "red" : "green"}
              />
              <InsightRow
                label="HTTP p50 latency"
                value={`${metrics.http.p50Ms} ms`}
                tone={metrics.http.p50Ms > 100 ? "orange" : "green"}
              />
              <InsightRow
                label="HTTP p99 latency"
                value={`${metrics.http.p99Ms} ms`}
                tone={metrics.http.p99Ms > 500 ? "red" : "orange"}
              />
              <InsightRow
                label="HTTP error rate"
                value={`${metrics.http.errorRatePct}%`}
                tone={metrics.http.errorRatePct > 2 ? "red" : "green"}
              />
              <InsightRow
                label="Active requests"
                value={metrics.http.activeRequests}
                tone="blue"
              />
              <InsightRow
                label="Loaded classes"
                value={metrics.jvm.classesLoaded}
                tone="purple"
              />
            </Stack>
          </SectionCard>
        </GridItem>
      </Grid>

      <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={6}>
        <GridItem>
          <SectionCard
            title="JVM Memory"
            subtitle="Heap and non-heap allocation overview"
            rightAction={<Icon as={HardDrive} color="blue.500" boxSize={5} />}
          >
            <Stack spacing={5}>
              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">
                    Heap usage
                  </Text>
                  <Text fontSize="sm" fontWeight="600">
                    {metrics.jvm.heapUsedMb} / {metrics.jvm.heapMaxMb} MB
                  </Text>
                </Flex>
                <Progress
                  value={heapPct}
                  colorScheme="blue"
                  borderRadius="full"
                />
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">
                    Non-heap usage
                  </Text>
                  <Text fontSize="sm" fontWeight="600">
                    {metrics.jvm.nonHeapUsedMb} / {metrics.jvm.nonHeapMaxMb} MB
                  </Text>
                </Flex>
                <Progress
                  value={nonHeapPct}
                  colorScheme="teal"
                  borderRadius="full"
                />
              </Box>

              <Divider />

              <SimpleGrid columns={2} spacing={4}>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    GC pause p95
                  </Text>
                  <Text fontWeight="700" fontSize="lg">
                    {metrics.jvm.gcPauseMsP95} ms
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Classes loaded
                  </Text>
                  <Text fontWeight="700" fontSize="lg">
                    {metrics.jvm.classesLoaded}
                  </Text>
                </Box>
              </SimpleGrid>
            </Stack>
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard
            title="Threads"
            subtitle="Thread inventory and state breakdown"
            rightAction={<Icon as={Waves} color="teal.500" boxSize={5} />}
          >
            <Stack spacing={4}>
              <SimpleGrid columns={3} spacing={4}>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Live
                  </Text>
                  <Text fontWeight="700" fontSize="lg">
                    {metrics.threads.live}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Daemon
                  </Text>
                  <Text fontWeight="700" fontSize="lg">
                    {metrics.threads.daemon}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Peak
                  </Text>
                  <Text fontWeight="700" fontSize="lg">
                    {metrics.threads.peak}
                  </Text>
                </Box>
              </SimpleGrid>

              <Divider />

              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>State</Th>
                    <Th isNumeric>Count</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>RUNNABLE</Td>
                    <Td isNumeric>{metrics.threads.states.runnable}</Td>
                  </Tr>
                  <Tr>
                    <Td>WAITING</Td>
                    <Td isNumeric>{metrics.threads.states.waiting}</Td>
                  </Tr>
                  <Tr>
                    <Td>TIMED_WAITING</Td>
                    <Td isNumeric>{metrics.threads.states.timedWaiting}</Td>
                  </Tr>
                  <Tr>
                    <Td>BLOCKED</Td>
                    <Td isNumeric>{metrics.threads.states.blocked}</Td>
                  </Tr>
                  <Tr>
                    <Td>NEW</Td>
                    <Td isNumeric>{metrics.threads.states.new}</Td>
                  </Tr>
                  <Tr>
                    <Td>TERMINATED</Td>
                    <Td isNumeric>{metrics.threads.states.terminated}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </Stack>
          </SectionCard>
        </GridItem>
      </Grid>

      <Grid templateColumns={{ base: "1fr", xl: "1.2fr 1fr" }} gap={6}>
        <GridItem>
          <SectionCard
            title="HTTP Metrics"
            subtitle="Traffic, latency, and request shape"
            rightAction={<Icon as={Timer} color="orange.500" boxSize={5} />}
          >
            <Stack spacing={5}>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    RPS
                  </Text>
                  <Text fontWeight="700" fontSize="lg">
                    {metrics.http.rps}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    p50
                  </Text>
                  <Text fontWeight="700" fontSize="lg">
                    {metrics.http.p50Ms} ms
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    p95
                  </Text>
                  <Text fontWeight="700" fontSize="lg">
                    {metrics.http.p95Ms} ms
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    p99
                  </Text>
                  <Text fontWeight="700" fontSize="lg">
                    {metrics.http.p99Ms} ms
                  </Text>
                </Box>
              </SimpleGrid>

              <Divider />

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">
                    Error rate
                  </Text>
                  <Text fontSize="sm" fontWeight="600">
                    {metrics.http.errorRatePct}%
                  </Text>
                </Flex>
                <Progress
                  value={metrics.http.errorRatePct * 10}
                  max={100}
                  colorScheme={metrics.http.errorRatePct > 2 ? "red" : "green"}
                  borderRadius="full"
                />
              </Box>

              <Divider />

              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Method</Th>
                    <Th isNumeric>Count</Th>
                    <Th isNumeric>Share</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {metrics.http.methods.map((row) => (
                    <Tr key={row.method}>
                      <Td>{row.method}</Td>
                      <Td isNumeric>{row.count}</Td>
                      <Td isNumeric>{row.pct}%</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Stack>
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard
            title="Database Pool"
            subtitle="Connection pool pressure and acquisition"
            rightAction={<Icon as={Database} color="red.500" boxSize={5} />}
          >
            <Stack spacing={5}>
              <SimpleGrid columns={2} spacing={4}>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Active
                  </Text>
                  <Text fontWeight="700" fontSize="lg">
                    {metrics.database.active}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Idle
                  </Text>
                  <Text fontWeight="700" fontSize="lg">
                    {metrics.database.idle}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Min
                  </Text>
                  <Text fontWeight="700" fontSize="lg">
                    {metrics.database.min}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Max
                  </Text>
                  <Text fontWeight="700" fontSize="lg">
                    {metrics.database.max}
                  </Text>
                </Box>
              </SimpleGrid>

              <Divider />

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">
                    Pool utilization
                  </Text>
                  <Text fontSize="sm" fontWeight="600">
                    {dbPoolPct}%
                  </Text>
                </Flex>
                <Progress
                  value={dbPoolPct}
                  colorScheme={dbPoolPct >= 80 ? "red" : "orange"}
                  borderRadius="full"
                />
              </Box>

              <Divider />

              <InsightRow
                label="Acquire latency p95"
                value={`${metrics.database.acquireMsP95} ms`}
                tone={metrics.database.acquireMsP95 > 50 ? "red" : "green"}
              />
              <InsightRow
                label="Configured usage"
                value={`${metrics.database.usagePct}%`}
                tone="orange"
              />
            </Stack>
          </SectionCard>
        </GridItem>
      </Grid>
    </Stack>
  );
}
