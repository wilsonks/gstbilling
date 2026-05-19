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
  LinkBox,
  LinkOverlay,
  Progress,
  SimpleGrid,
  Skeleton,
  Spinner,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  Activity,
  ArrowRight,
  Building2,
  FileSearch,
  Landmark,
  RefreshCw,
  Shield,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import api from "../../services/api";

function formatDateTime(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
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

function MetricCard({
  label,
  value,
  helpText,
  icon,
  color = "blue.500",
  loading = false,
}) {
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
            <StatNumber fontSize="2xl">
              {loading ? <Skeleton height="30px" width="90px" /> : value}
            </StatNumber>
            <StatHelpText mb="0">
              {loading ? <Skeleton height="16px" width="150px" /> : helpText}
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

function QuickLinkCard({ to, title, description, icon }) {
  return (
    <LinkBox
      as={Card}
      borderWidth="1px"
      borderColor="gray.200"
      shadow="sm"
      borderRadius="xl"
      _hover={{ shadow: "md", transform: "translateY(-1px)" }}
      transition="all 0.2s ease"
    >
      <CardBody>
        <Stack spacing={3}>
          <Flex justify="space-between" align="center">
            <Flex
              align="center"
              justify="center"
              boxSize="44px"
              borderRadius="lg"
              bg="gray.50"
              color="blue.500"
            >
              <Icon as={icon} boxSize={5} />
            </Flex>

            <Icon as={ArrowRight} color="gray.400" boxSize={4} />
          </Flex>

          <Box>
            <Heading size="sm">
              <LinkOverlay as={RouterLink} to={to}>
                {title}
              </LinkOverlay>
            </Heading>
            <Text mt={1} color="gray.500" fontSize="sm">
              {description}
            </Text>
          </Box>
        </Stack>
      </CardBody>
    </LinkBox>
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

function SectionCard({ title, action, children }) {
  return (
    <Card
      borderWidth="1px"
      borderColor="gray.200"
      shadow="sm"
      borderRadius="xl"
    >
      <CardBody>
        <Flex justify="space-between" align="center" mb={5}>
          <Heading size="md">{title}</Heading>
          {action}
        </Flex>
        {children}
      </CardBody>
    </Card>
  );
}

function RecentAuditItem({ item }) {
  return (
    <Flex
      justify="space-between"
      align={{ base: "flex-start", md: "center" }}
      direction={{ base: "column", md: "row" }}
      gap={3}
      py={3}
    >
      <Box>
        <HStack spacing={2} flexWrap="wrap">
          <Text fontWeight="600">{item.username || "—"}</Text>
          <Badge colorScheme={getActionColorScheme(item.action)}>
            {item.action || "—"}
          </Badge>
          {item.companyId != null && (
            <Badge variant="outline">Company #{item.companyId}</Badge>
          )}
        </HStack>

        <Text mt={1} fontSize="sm" color="gray.500">
          {item.ip || "No IP"} • {formatDateTime(item.timestamp)}
        </Text>
      </Box>
    </Flex>
  );
}

function RecentTenantItem({ item }) {
  return (
    <Box py={3}>
      <HStack spacing={2} mb={1} flexWrap="wrap">
        <Text fontWeight="600">{item.name || "—"}</Text>
        <Badge colorScheme={item.active ? "green" : "red"}>
          {item.active ? "ACTIVE" : "INACTIVE"}
        </Badge>
        <Badge variant="outline">Tenant #{item.tenantId}</Badge>
      </HStack>
      <Text fontSize="sm" color="gray.500">
        {item.contactEmail || "—"} • GSTIN: {item.gstin || "—"}
      </Text>
    </Box>
  );
}

function RecentCompanyItem({ item }) {
  return (
    <Box py={3}>
      <HStack spacing={2} mb={1} flexWrap="wrap">
        <Text fontWeight="600">{item.name || "—"}</Text>
        <Badge colorScheme={item.active ? "green" : "red"}>
          {item.active ? "ACTIVE" : "INACTIVE"}
        </Badge>
        <Badge variant="outline">Company #{item.id}</Badge>
      </HStack>
      <Text fontSize="sm" color="gray.500">
        Tenant #{item.tenantId ?? "—"} • {item.email || "—"}
      </Text>
    </Box>
  );
}

function RecentUserItem({ item }) {
  return (
    <Box py={3}>
      <HStack spacing={2} mb={1} flexWrap="wrap">
        <Text fontWeight="600">{item.username || "—"}</Text>
        <Badge colorScheme={item.scope === "PLATFORM" ? "purple" : "blue"}>
          {item.scope || "—"}
        </Badge>
        <Badge variant="outline">User #{item.id}</Badge>
      </HStack>
      <Text fontSize="sm" color="gray.500">
        {item.email || "—"} • Tenant #{item.tenantId ?? "—"}
      </Text>
    </Box>
  );
}

function RecentAccessItem({ item }) {
  return (
    <Box py={3}>
      <HStack spacing={2} mb={1} flexWrap="wrap">
        <Badge colorScheme="blue">User #{item.userId}</Badge>
        <Badge colorScheme="purple">Company #{item.companyId}</Badge>
        <Badge colorScheme={item.active ? "green" : "red"}>
          {item.active ? "ACTIVE" : "INACTIVE"}
        </Badge>
      </HStack>
      <Text fontSize="sm" color="gray.500">
        Role: {item.role || "—"} • Tenant #{item.tenantId ?? "—"} •{" "}
        {formatDateTime(item.createdAt)}
      </Text>
    </Box>
  );
}

export default function DashboardPage() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [tenantStats, setTenantStats] = useState(null);
  const [companyStats, setCompanyStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userAccessStats, setUserAccessStats] = useState(null);
  const [auditStats, setAuditStats] = useState(null);

  const fetchDashboardStats = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [tenantsRes, companiesRes, usersRes, userAccessRes, auditRes] =
        await Promise.all([
          api.get("/api/platform/tenants/stats"),
          api.get("/api/platform/companies/stats"),
          api.get("/api/platform/users/stats"),
          api.get("/api/platform/user-access/stats"),
          api.get("/api/platform/audit-logs/stats"),
        ]);

      setTenantStats(tenantsRes.data || {});
      setCompanyStats(companiesRes.data || {});
      setUserStats(usersRes.data || {});
      setUserAccessStats(userAccessRes.data || {});
      setAuditStats(auditRes.data || {});
    } catch (error) {
      toast({
        title: "Failed to load dashboard stats",
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
    fetchDashboardStats();
  }, []);

  const tenantActivePct = useMemo(() => {
    const total = Number(tenantStats?.total || 0);
    const active = Number(tenantStats?.active || 0);
    if (!total) return 0;
    return Math.round((active / total) * 100);
  }, [tenantStats]);

  const companyActivePct = useMemo(() => {
    const total = Number(companyStats?.total || 0);
    const active = Number(companyStats?.active || 0);
    if (!total) return 0;
    return Math.round((active / total) * 100);
  }, [companyStats]);

  const accessActivePct = useMemo(() => {
    const total = Number(userAccessStats?.total || 0);
    const active = Number(userAccessStats?.active || 0);
    if (!total) return 0;
    return Math.round((active / total) * 100);
  }, [userAccessStats]);

  const tenantUserPct = useMemo(() => {
    const total = Number(userStats?.total || 0);
    const tenantUsers = Number(userStats?.tenantUsers || 0);
    if (!total) return 0;
    return Math.round((tenantUsers / total) * 100);
  }, [userStats]);

  const loginSuccessCount = useMemo(
    () =>
      (auditStats?.recent || []).filter((x) => x.action === "LOGIN_SUCCESS")
        .length,
    [auditStats],
  );

  const logoutCount = useMemo(
    () =>
      (auditStats?.recent || []).filter((x) => x.action === "LOGOUT_SUCCESS")
        .length,
    [auditStats],
  );

  return (
    <Stack spacing={6}>
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Box>
          <Heading size="lg">Platform Dashboard</Heading>
          <Text color="gray.500" mt={1}>
            Connected overview of tenants, companies, users, access, and audit
            activity.
          </Text>
        </Box>

        <HStack spacing={3}>
          <Badge colorScheme="green" px={3} py={1} borderRadius="full">
            Live Stats
          </Badge>

          <Button
            leftIcon={<RefreshCw size={16} />}
            variant="outline"
            onClick={() => fetchDashboardStats({ silent: true })}
            isLoading={refreshing}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing={4}>
        <MetricCard
          label="Tenants"
          value={tenantStats?.total ?? "—"}
          helpText={`Active: ${tenantStats?.active ?? 0} • Inactive: ${tenantStats?.inactive ?? 0}`}
          icon={Shield}
          color="purple.500"
          loading={loading}
        />
        <MetricCard
          label="Companies"
          value={companyStats?.total ?? "—"}
          helpText={`Active: ${companyStats?.active ?? 0} • Inactive: ${companyStats?.inactive ?? 0}`}
          icon={Building2}
          color="blue.500"
          loading={loading}
        />
        <MetricCard
          label="Users"
          value={userStats?.total ?? "—"}
          helpText={`Platform: ${userStats?.platformUsers ?? 0} • Tenant: ${userStats?.tenantUsers ?? 0}`}
          icon={Users}
          color="teal.500"
          loading={loading}
        />
        <MetricCard
          label="Access Records"
          value={userAccessStats?.total ?? "—"}
          helpText={`Active: ${userAccessStats?.active ?? 0} • Inactive: ${userAccessStats?.inactive ?? 0}`}
          icon={UserCog}
          color="orange.500"
          loading={loading}
        />
        <MetricCard
          label="Audit Events"
          value={auditStats?.total ?? "—"}
          helpText={`Today: ${auditStats?.today ?? 0}`}
          icon={Activity}
          color="red.500"
          loading={loading}
        />
        <MetricCard
          label="Unique Audit Users"
          value={auditStats?.uniqueUsers ?? "—"}
          helpText={`Recent logins: ${loginSuccessCount} • Logouts: ${logoutCount}`}
          icon={FileSearch}
          color="cyan.500"
          loading={loading}
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", xl: "1.4fr 1fr" }} gap={6}>
        <GridItem>
          <SectionCard title="Operational Health">
            <Stack spacing={5}>
              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">
                    Tenant activation
                  </Text>
                  <Text fontSize="sm" fontWeight="600">
                    {tenantActivePct}%
                  </Text>
                </Flex>
                <Progress
                  value={tenantActivePct}
                  colorScheme="purple"
                  borderRadius="full"
                />
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">
                    Company activation
                  </Text>
                  <Text fontSize="sm" fontWeight="600">
                    {companyActivePct}%
                  </Text>
                </Flex>
                <Progress
                  value={companyActivePct}
                  colorScheme="blue"
                  borderRadius="full"
                />
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">
                    Active access ratio
                  </Text>
                  <Text fontSize="sm" fontWeight="600">
                    {accessActivePct}%
                  </Text>
                </Flex>
                <Progress
                  value={accessActivePct}
                  colorScheme="green"
                  borderRadius="full"
                />
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">
                    Tenant user share
                  </Text>
                  <Text fontSize="sm" fontWeight="600">
                    {tenantUserPct}%
                  </Text>
                </Flex>
                <Progress
                  value={tenantUserPct}
                  colorScheme="teal"
                  borderRadius="full"
                />
              </Box>

              <Divider />

              <Stack spacing={3}>
                <InsightRow
                  label="Recent tenants loaded"
                  value={(tenantStats?.recentTenants || []).length}
                  tone="purple"
                />
                <InsightRow
                  label="Recent companies loaded"
                  value={(companyStats?.recentCompanies || []).length}
                  tone="blue"
                />
                <InsightRow
                  label="Recent users loaded"
                  value={(userStats?.recentUsers || []).length}
                  tone="teal"
                />
                <InsightRow
                  label="Recent access records"
                  value={(userAccessStats?.recentAccesses || []).length}
                  tone="orange"
                />
                <InsightRow
                  label="Recent audit events"
                  value={(auditStats?.recent || []).length}
                  tone="red"
                />
              </Stack>
            </Stack>
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard title="Quick Actions">
            <Stack spacing={4}>
              <QuickLinkCard
                to="/admin/tenants"
                title="Manage Tenants"
                description="Review tenant status and recently created tenant workspaces."
                icon={Shield}
              />
              <QuickLinkCard
                to="/admin/companies"
                title="Manage Companies"
                description="Inspect business entities and activation coverage."
                icon={Building2}
              />
              <QuickLinkCard
                to="/admin/users"
                title="Manage Users"
                description="Review identities across platform and tenant scopes."
                icon={Users}
              />
              <QuickLinkCard
                to="/admin/user-access"
                title="Manage Access"
                description="Grant, review, and revoke company access records."
                icon={ShieldCheck}
              />
              <QuickLinkCard
                to="/admin/audit-logs"
                title="Audit Logs"
                description="Search, inspect, and export auth activity."
                icon={FileSearch}
              />
            </Stack>
          </SectionCard>
        </GridItem>
      </Grid>

      <Grid templateColumns={{ base: "1fr", xl: "1.2fr 1fr 1fr" }} gap={6}>
        <GridItem>
          <SectionCard
            title="Recent Audit Activity"
            action={
              <Button
                as={RouterLink}
                to="/admin/audit-logs"
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight size={14} />}
              >
                View all
              </Button>
            }
          >
            {loading ? (
              <Stack spacing={4}>
                <Skeleton height="56px" />
                <Skeleton height="56px" />
                <Skeleton height="56px" />
              </Stack>
            ) : (auditStats?.recent || []).length === 0 ? (
              <Box py={8} textAlign="center">
                <Text fontWeight="600">No recent audit events</Text>
                <Text mt={1} color="gray.500">
                  Activity will appear here as users authenticate and switch
                  context.
                </Text>
              </Box>
            ) : (
              <Stack divider={<Divider />} spacing={0}>
                {(auditStats?.recent || []).slice(0, 8).map((item) => (
                  <RecentAuditItem key={item.id} item={item} />
                ))}
              </Stack>
            )}
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard
            title="Recent Tenants"
            action={
              <Button
                as={RouterLink}
                to="/admin/tenants"
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight size={14} />}
              >
                View all
              </Button>
            }
          >
            {loading ? (
              <Stack spacing={4}>
                <Skeleton height="44px" />
                <Skeleton height="44px" />
                <Skeleton height="44px" />
              </Stack>
            ) : (tenantStats?.recentTenants || []).length === 0 ? (
              <Text color="gray.500">No recent tenants available.</Text>
            ) : (
              <Stack divider={<Divider />} spacing={0}>
                {(tenantStats?.recentTenants || []).slice(0, 5).map((item) => (
                  <RecentTenantItem key={item.tenantId} item={item} />
                ))}
              </Stack>
            )}
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard
            title="Recent Companies"
            action={
              <Button
                as={RouterLink}
                to="/admin/companies"
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight size={14} />}
              >
                View all
              </Button>
            }
          >
            {loading ? (
              <Stack spacing={4}>
                <Skeleton height="44px" />
                <Skeleton height="44px" />
                <Skeleton height="44px" />
              </Stack>
            ) : (companyStats?.recentCompanies || []).length === 0 ? (
              <Text color="gray.500">No recent companies available.</Text>
            ) : (
              <Stack divider={<Divider />} spacing={0}>
                {(companyStats?.recentCompanies || [])
                  .slice(0, 5)
                  .map((item) => (
                    <RecentCompanyItem key={item.id} item={item} />
                  ))}
              </Stack>
            )}
          </SectionCard>
        </GridItem>
      </Grid>

      <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={6}>
        <GridItem>
          <SectionCard
            title="Recent Users"
            action={
              <Button
                as={RouterLink}
                to="/admin/users"
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight size={14} />}
              >
                View all
              </Button>
            }
          >
            {loading ? (
              <Stack spacing={4}>
                <Skeleton height="44px" />
                <Skeleton height="44px" />
                <Skeleton height="44px" />
              </Stack>
            ) : (userStats?.recentUsers || []).length === 0 ? (
              <Text color="gray.500">No recent users available.</Text>
            ) : (
              <Stack divider={<Divider />} spacing={0}>
                {(userStats?.recentUsers || []).slice(0, 5).map((item) => (
                  <RecentUserItem key={item.id} item={item} />
                ))}
              </Stack>
            )}
          </SectionCard>
        </GridItem>

        <GridItem>
          <SectionCard
            title="Recent Access Grants"
            action={
              <Button
                as={RouterLink}
                to="/admin/user-access"
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight size={14} />}
              >
                View all
              </Button>
            }
          >
            {loading ? (
              <Stack spacing={4}>
                <Skeleton height="44px" />
                <Skeleton height="44px" />
                <Skeleton height="44px" />
              </Stack>
            ) : (userAccessStats?.recentAccesses || []).length === 0 ? (
              <Text color="gray.500">No recent access records available.</Text>
            ) : (
              <Stack divider={<Divider />} spacing={0}>
                {(userAccessStats?.recentAccesses || [])
                  .slice(0, 5)
                  .map((item) => (
                    <RecentAccessItem key={item.id} item={item} />
                  ))}
              </Stack>
            )}
          </SectionCard>
        </GridItem>
      </Grid>
    </Stack>
  );
}
