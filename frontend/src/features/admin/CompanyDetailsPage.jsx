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
  useDisclosure,
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
  Pencil,
  Phone,
  MapPin,
  Landmark,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import CompanyEditModal from "./CompanyEditModal";

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

function formatCompanyType(type) {
  return type ? type.replaceAll("_", " ") : "—";
}

export default function CompanyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const editModal = useDisclosure();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/platform/companies/${id}`);
      setCompany(res.data);
    } catch (error) {
      toast({
        title: "Failed to load company",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const handleSave = async (payload) => {
    if (!company) return;

    setSaving(true);
    try {
      await api.put(`/api/platform/companies/${company.id}`, payload);

      toast({
        title: "Company updated",
        description: "Changes saved successfully.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      editModal.onClose();
      await fetchCompany();
    } catch (error) {
      toast({
        title: "Failed to update company",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!company) return;

    setActionLoading(true);
    try {
      await api.post(`/api/platform/companies/${company.id}/deactivate`);
      toast({
        title: "Company deactivated",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      await fetchCompany();
    } catch (error) {
      toast({
        title: "Failed to deactivate company",
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
    if (!company) return;

    setActionLoading(true);
    try {
      await api.post(`/api/platform/companies/${company.id}/reactivate`);
      toast({
        title: "Company reactivated",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      await fetchCompany();
    } catch (error) {
      toast({
        title: "Failed to reactivate company",
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

  if (!company) {
    return (
      <Card>
        <CardBody>
          <Stack spacing={3}>
            <Heading size="md">Company not found</Heading>
            <Text color="gray.500">
              The requested company could not be loaded.
            </Text>
            <HStack>
              <Button
                leftIcon={<ArrowLeft size={16} />}
                onClick={() => navigate("/admin/companies")}
              >
                Back to Companies
              </Button>
            </HStack>
          </Stack>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
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
                onClick={() => navigate("/admin/companies")}
              >
                Back
              </Button>

              <Badge
                colorScheme={company.active ? "green" : "orange"}
                px={2}
                py={1}
              >
                {company.active ? "Active" : "Inactive"}
              </Badge>
            </HStack>

            <Heading size="lg">{company.name}</Heading>
            <Text color="gray.500" mt={1}>
              Company #{company.id}
            </Text>
          </Box>

          <HStack spacing={3} flexWrap="wrap">
            <Button
              leftIcon={<RefreshCw size={16} />}
              variant="outline"
              onClick={fetchCompany}
              isLoading={loading}
            >
              Refresh
            </Button>

            <Button leftIcon={<Pencil size={16} />} onClick={editModal.onOpen}>
              Edit
            </Button>

            {company.active ? (
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
                  <StatLabel>Company ID</StatLabel>
                  <StatNumber fontSize="xl">{company.id}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Tenant ID</StatLabel>
                  <StatNumber fontSize="xl">{company.tenantId}</StatNumber>
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
                    color={company.active ? "green.500" : "orange.500"}
                  >
                    {company.active ? "Active" : "Inactive"}
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
                  <Heading size="md">Company Information</Heading>
                </HStack>

                <Divider mb={2} />

                <InfoRow label="Company Name" value={company.name} />
                <Divider />

                <InfoRow label="Legal Name">
                  <Text fontWeight="500">{company.legalName || "—"}</Text>
                </InfoRow>
                <Divider />

                <InfoRow label="Trade Name">
                  <Text fontWeight="500">{company.tradeName || "—"}</Text>
                </InfoRow>
                <Divider />

                <InfoRow label="GSTIN">
                  <HStack justify={{ base: "flex-start", md: "flex-end" }}>
                    <Hash size={14} />
                    <Text fontWeight="500">{company.gstin || "—"}</Text>
                  </HStack>
                </InfoRow>
                <Divider />

                <InfoRow label="PAN">
                  <Text fontWeight="500">{company.pan || "—"}</Text>
                </InfoRow>
                <Divider />

                <InfoRow label="State Code">
                  <Text fontWeight="500">{company.stateCode || "—"}</Text>
                </InfoRow>
                <Divider />

                <InfoRow label="Type">
                  <Text fontWeight="500">{formatCompanyType(company.type)}</Text>
                </InfoRow>
                <Divider />

                <InfoRow label="Email">
                  <HStack justify={{ base: "flex-start", md: "flex-end" }}>
                    <Mail size={14} />
                    <Text fontWeight="500">{company.email || "—"}</Text>
                  </HStack>
                </InfoRow>
                <Divider />

                <InfoRow label="Phone">
                  <HStack justify={{ base: "flex-start", md: "flex-end" }}>
                    <Phone size={14} />
                    <Text fontWeight="500">{company.phone || "—"}</Text>
                  </HStack>
                </InfoRow>
                <Divider />

                <InfoRow label="Address Line 1">
                  <HStack justify={{ base: "flex-start", md: "flex-end" }}>
                    <MapPin size={14} />
                    <Text fontWeight="500">{company.addressLine1 || "—"}</Text>
                  </HStack>
                </InfoRow>
                <Divider />

                <InfoRow label="Address Line 2">
                  <Text fontWeight="500">{company.addressLine2 || "—"}</Text>
                </InfoRow>
                <Divider />

                <InfoRow label="City">
                  <Text fontWeight="500">{company.city || "—"}</Text>
                </InfoRow>
                <Divider />

                <InfoRow label="State">
                  <Text fontWeight="500">{company.state || "—"}</Text>
                </InfoRow>
                <Divider />

                <InfoRow label="Pincode">
                  <Text fontWeight="500">{company.pincode || "—"}</Text>
                </InfoRow>
                <Divider />

                <InfoRow label="Country">
                  <Text fontWeight="500">{company.country || "—"}</Text>
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

                  <InfoRow label="Tenant ID">
                    <HStack justify={{ base: "flex-start", md: "flex-end" }}>
                      <Landmark size={14} />
                      <Text fontWeight="500">{company.tenantId ?? "—"}</Text>
                    </HStack>
                  </InfoRow>
                  <Divider />
                  <InfoRow
                    label="Created By"
                    value={company.createdBy || "system"}
                  />
                  <Divider />
                  <InfoRow
                    label="Updated By"
                    value={company.updatedBy || "system"}
                  />
                  <Divider />
                  <InfoRow
                    label="Created At"
                    value={
                      company.createdAt
                        ? new Date(company.createdAt).toLocaleString()
                        : "—"
                    }
                  />
                  <Divider />
                  <InfoRow
                    label="Updated At"
                    value={
                      company.updatedAt
                        ? new Date(company.updatedAt).toLocaleString()
                        : "—"
                    }
                  />
                  <Divider />
                  <InfoRow label="Version" value={company.version ?? "—"} />
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
                      leftIcon={<Pencil size={16} />}
                      onClick={editModal.onOpen}
                    >
                      Edit Company
                    </Button>

                    <Button
                      variant="outline"
                      leftIcon={<RefreshCw size={16} />}
                      onClick={fetchCompany}
                    >
                      Refresh Company
                    </Button>

                    {company.active ? (
                      <Button
                        variant="outline"
                        colorScheme="orange"
                        leftIcon={<Power size={16} />}
                        onClick={handleDeactivate}
                        isLoading={actionLoading}
                      >
                        Deactivate Company
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        colorScheme="green"
                        leftIcon={<RotateCcw size={16} />}
                        onClick={handleReactivate}
                        isLoading={actionLoading}
                      >
                        Reactivate Company
                      </Button>
                    )}
                  </Stack>
                </CardBody>
              </Card>
            </Stack>
          </GridItem>
        </Grid>
      </Stack>

      <CompanyEditModal
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
        company={company}
        onSave={handleSave}
        isSubmitting={saving}
      />
    </>
  );
}