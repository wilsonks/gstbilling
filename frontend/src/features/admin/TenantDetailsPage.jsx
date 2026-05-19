import React, { useEffect, useState } from "react";
import {
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
  Spinner,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Badge,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  RefreshCw,
  Power,
  RotateCcw,
  Mail,
  Building2,
  Hash,
  ShieldCheck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function InfoRow({ label, value, children }) {
  return (
    <Flex
      py={3}
      justify="space-between"
      align={{ base: "flex-start", md: "center" }}
      direction={{ base: "column", md: "row" }}
      gap={2}
    >
      <Text color="gray.500" minW="160px">
        {label}
      </Text>

      <Box textAlign={{ base: "left", md: "right" }} flex="1">
        {children || <Text fontWeight="500">{value || "—"}</Text>}
      </Box>
    </Flex>
  );
}

export default function TenantDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTenant = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/platform/tenants/${id}`);
      setTenant(res.data);
    } catch (error) {
      toast({
        title: "Failed to load tenant",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, [id]);

  const handleDeactivate = async () => {
    if (!tenant) return;

    setActionLoading(true);
    try {
      await api.post(`/api/platform/tenants/${tenant.tenantId}/deactivate`);
      toast({
        title: "Tenant deactivated",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      await fetchTenant();
    } catch (error) {
      toast({
        title: "Failed to deactivate tenant",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!tenant) return;

    setActionLoading(true);
    try {
      await api.post(`/api/platform/tenants/${tenant.tenantId}/reactivate`);
      toast({
        title: "Tenant reactivated",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      await fetchTenant();
    } catch (error) {
      toast({
        title: "Failed to reactivate tenant",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" py={16}>
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (!tenant) {
    return (
      <Card>
        <CardBody>
          <Stack spacing={3}>
            <Heading size="md">Tenant not found</Heading>
            <Text color="gray.500">
              The requested tenant could not be loaded.
            </Text>
            <HStack>
              <Button
                leftIcon={<ArrowLeft size={16} />}
                onClick={() => navigate("/admin/tenants")}
              >
                Back to Tenants
              </Button>
            </HStack>
          </Stack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Stack spacing={6}>
      <Flex
        justify="space-between"
        align={{ base: "stretch", lg: "center" }}
        direction={{ base: "column", lg: "row" }}
        gap={4}
      >
        <Box>
          <HStack spacing={3} mb={2}>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<ArrowLeft size={14} />}
              onClick={() => navigate("/admin/tenants")}
            >
              Back
            </Button>

            <Badge
              colorScheme={tenant.active ? "green" : "orange"}
              px={2}
              py={1}
            >
              {tenant.active ? "Active" : "Inactive"}
            </Badge>
          </HStack>

          <Heading size="lg">{tenant.name}</Heading>
          <Text color="gray.500" mt={1}>
            Tenant #{tenant.tenantId}
          </Text>
        </Box>

        <HStack spacing={3} flexWrap="wrap">
          <Button
            leftIcon={<RefreshCw size={16} />}
            variant="outline"
            onClick={fetchTenant}
            isLoading={loading}
          >
            Refresh
          </Button>

          {tenant.active ? (
            <Button
              leftIcon={<Power size={16} />}
              colorScheme="orange"
              variant="outline"
              onClick={handleDeactivate}
              isLoading={actionLoading}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              leftIcon={<RotateCcw size={16} />}
              colorScheme="green"
              variant="outline"
              onClick={handleReactivate}
              isLoading={actionLoading}
            >
              Reactivate
            </Button>
          )}
        </HStack>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Tenant ID</StatLabel>
                <StatNumber fontSize="xl">{tenant.tenantId}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Status</StatLabel>
                <StatNumber
                  fontSize="xl"
                  color={tenant.active ? "green.500" : "orange.500"}
                >
                  {tenant.active ? "Active" : "Inactive"}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Created By</StatLabel>
                <StatNumber fontSize="xl">
                  {tenant.createdBy || "system"}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={6}>
        <GridItem>
          <Card>
            <CardBody>
              <HStack spacing={3} mb={4}>
                <Building2 size={18} />
                <Heading size="md">Tenant Information</Heading>
              </HStack>

              <Divider mb={2} />

              <InfoRow label="Tenant Name" value={tenant.name} />
              <Divider />

              <InfoRow label="GSTIN" value={tenant.gstin}>
                <HStack justify={{ base: "flex-start", md: "flex-end" }}>
                  <Hash size={14} />
                  <Text fontWeight="500">{tenant.gstin || "—"}</Text>
                </HStack>
              </InfoRow>
              <Divider />

              <InfoRow label="Contact Email" value={tenant.contactEmail}>
                <HStack justify={{ base: "flex-start", md: "flex-end" }}>
                  <Mail size={14} />
                  <Text fontWeight="500">{tenant.contactEmail || "—"}</Text>
                </HStack>
              </InfoRow>
              <Divider />

              <InfoRow label="Status">
                <Badge colorScheme={tenant.active ? "green" : "orange"}>
                  {tenant.active ? "Active" : "Inactive"}
                </Badge>
              </InfoRow>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Stack spacing={6}>
            <Card>
              <CardBody>
                <HStack spacing={3} mb={4}>
                  <ShieldCheck size={18} />
                  <Heading size="md">Audit</Heading>
                </HStack>

                <Divider mb={2} />

                <InfoRow
                  label="Created By"
                  value={tenant.createdBy || "system"}
                />
                <Divider />
                <InfoRow
                  label="Updated By"
                  value={tenant.updatedBy || "system"}
                />
                <Divider />
                <InfoRow
                  label="Created At"
                  value={
                    tenant.createdAt
                      ? new Date(tenant.createdAt).toLocaleString()
                      : "—"
                  }
                />
                <Divider />
                <InfoRow
                  label="Updated At"
                  value={
                    tenant.updatedAt
                      ? new Date(tenant.updatedAt).toLocaleString()
                      : "—"
                  }
                />
                <Divider />
                <InfoRow label="Version" value={tenant.version ?? "—"} />
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Heading size="sm" mb={3}>
                  Quick Actions
                </Heading>

                <Stack spacing={3}>
                  <Button
                    variant="outline"
                    leftIcon={<RefreshCw size={16} />}
                    onClick={fetchTenant}
                  >
                    Refresh Tenant
                  </Button>

                  {tenant.active ? (
                    <Button
                      variant="outline"
                      colorScheme="orange"
                      leftIcon={<Power size={16} />}
                      onClick={handleDeactivate}
                      isLoading={actionLoading}
                    >
                      Deactivate Tenant
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      colorScheme="green"
                      leftIcon={<RotateCcw size={16} />}
                      onClick={handleReactivate}
                      isLoading={actionLoading}
                    >
                      Reactivate Tenant
                    </Button>
                  )}
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </GridItem>
      </Grid>
    </Stack>
  );
}
