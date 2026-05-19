import React, { useEffect, useState } from "react";
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
  IconButton,
  Spinner,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { ArrowLeft, Ban, Pencil, RefreshCw, ShieldCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import UserAccessEditModal from "./UserAccessEditModal";

function ActiveBadge({ active }) {
  return (
    <Badge colorScheme={active ? "green" : "red"}>
      {active ? "ACTIVE" : "INACTIVE"}
    </Badge>
  );
}

function DetailItem({ label, value }) {
  return (
    <Box>
      <Text fontSize="sm" color="gray.500" mb={1}>
        {label}
      </Text>
      <Box fontWeight="500">{value ?? "—"}</Box>
    </Box>
  );
}

function formatDateTime(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function UserAccessDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const editModal = useDisclosure();

  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const fetchAccess = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await api.get(`/api/platform/user-access/${id}`);
      setAccess(res.data);
    } catch (error) {
      setAccess(null);
      toast({
        title: "Failed to load access record",
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
    fetchAccess();
  }, [id]);

  const handleSave = async (payload) => {
    if (!access?.id) return;

    setIsSaving(true);
    try {
      await api.put(`/api/platform/user-access/${access.id}`, payload);

      toast({
        title: "Access updated",
        description: "Changes saved successfully.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      editModal.onClose();
      await fetchAccess({ silent: true });
    } catch (error) {
      toast({
        title: "Failed to update access",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevoke = async () => {
    if (!access?.id || !access.active) return;

    setIsRevoking(true);
    try {
      await api.post(`/api/platform/user-access/${access.id}/revoke`);

      toast({
        title: "Access revoked",
        description: "The access entry is now inactive.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      await fetchAccess({ silent: true });
    } catch (error) {
      toast({
        title: "Failed to revoke access",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsRevoking(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" py={12}>
        <Spinner />
      </Flex>
    );
  }

  if (!access) {
    return (
      <Stack spacing={4}>
        <Button
          leftIcon={<ArrowLeft size={16} />}
          variant="ghost"
          alignSelf="flex-start"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        <Card>
          <CardBody>
            <Text fontWeight="600">Access record not found</Text>
            <Text color="gray.500" mt={1}>
              The requested access record could not be loaded.
            </Text>
          </CardBody>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack spacing={6}>
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <HStack align="flex-start" spacing={3}>
          <IconButton
            aria-label="Go back"
            icon={<ArrowLeft size={16} />}
            variant="ghost"
            onClick={() => navigate(-1)}
          />

          <Box>
            <Heading size="lg">Access #{access.id}</Heading>
            <Text color="gray.500" mt={1}>
              User access details and audit information
            </Text>
          </Box>
        </HStack>

        <HStack spacing={3}>
          <Button
            leftIcon={<RefreshCw size={16} />}
            variant="outline"
            onClick={() => fetchAccess({ silent: true })}
            isLoading={refreshing}
          >
            Refresh
          </Button>

          <Button leftIcon={<Pencil size={16} />} onClick={editModal.onOpen}>
            Edit Access
          </Button>

          {access.active && (
            <Button
              leftIcon={<Ban size={16} />}
              colorScheme="red"
              variant="outline"
              onClick={handleRevoke}
              isLoading={isRevoking}
            >
              Revoke
            </Button>
          )}
        </HStack>
      </Flex>

      <Card>
        <CardBody>
          <Flex
            align={{ base: "flex-start", md: "center" }}
            justify="space-between"
            direction={{ base: "column", md: "row" }}
            gap={4}
          >
            <HStack spacing={4} align="center">
              <Flex
                align="center"
                justify="center"
                boxSize="52px"
                borderRadius="full"
                bg="gray.100"
              >
                <ShieldCheck size={22} />
              </Flex>

              <Box>
                <Heading size="md">Access #{access.id}</Heading>
                <Text color="gray.500">
                  User {access.userId} • Company {access.companyId}
                </Text>
              </Box>
            </HStack>

            <HStack spacing={3} flexWrap="wrap">
              <Badge colorScheme="gray">
                {access.role?.replaceAll("_", " ") || "—"}
              </Badge>
              <ActiveBadge active={access.active} />
            </HStack>
          </Flex>
        </CardBody>
      </Card>

      <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={6}>
        <GridItem>
          <Stack spacing={6}>
            <Card>
              <CardBody>
                <Heading size="sm" mb={4}>
                  Access Details
                </Heading>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                  <DetailItem label="Access ID" value={access.id} />
                  <DetailItem label="User ID" value={access.userId} />
                  <DetailItem label="Company ID" value={access.companyId} />
                  <DetailItem label="Tenant ID" value={access.tenantId} />
                  <DetailItem
                    label="Role"
                    value={
                      <Badge colorScheme="gray">
                        {access.role?.replaceAll("_", " ") || "—"}
                      </Badge>
                    }
                  />
                  <DetailItem
                    label="Status"
                    value={<ActiveBadge active={access.active} />}
                  />
                  <DetailItem label="Version" value={access.version ?? "—"} />
                </Grid>
              </CardBody>
            </Card>
          </Stack>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Heading size="sm" mb={4}>
                Audit
              </Heading>

              <Stack spacing={4}>
                <DetailItem
                  label="Created At"
                  value={formatDateTime(access.createdAt)}
                />
                <Divider />
                <DetailItem
                  label="Created By"
                  value={access.createdBy || "—"}
                />
                <Divider />
                <DetailItem
                  label="Updated At"
                  value={formatDateTime(access.updatedAt)}
                />
                <Divider />
                <DetailItem
                  label="Updated By"
                  value={access.updatedBy || "—"}
                />
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <UserAccessEditModal
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
        access={access}
        onSave={handleSave}
        isSubmitting={isSaving}
      />
    </Stack>
  );
}
