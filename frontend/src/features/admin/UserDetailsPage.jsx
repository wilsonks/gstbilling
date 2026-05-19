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
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  Pencil,
  RefreshCw,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import UserEditModal from "./UserEditModal";

function ScopeBadge({ scope }) {
  return (
    <Badge colorScheme={scope === "PLATFORM" ? "purple" : "blue"}>
      {scope || "—"}
    </Badge>
  );
}

function RoleBadges({ roles }) {
  if (!roles?.length) {
    return <Text color="gray.500">—</Text>;
  }

  return (
    <HStack spacing={2} flexWrap="wrap">
      {roles.map((role) => (
        <Badge key={role} colorScheme="gray">
          {role.replaceAll("_", " ")}
        </Badge>
      ))}
    </HStack>
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

export default function UserDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const editModal = useDisclosure();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/platform/users/${id}`);
      setUser(res.data);
    } catch (error) {
      setUser(null);
      toast({
        title: "Failed to load user",
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
    fetchUser();
  }, [id]);

  const handleSave = async (payload) => {
    if (!user?.id) return;

    setSubmitting(true);
    try {
      await api.put(`/api/platform/users/${user.id}`, payload);

      toast({
        title: "User updated",
        description: "Changes saved successfully.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      editModal.onClose();
      await fetchUser();
    } catch (error) {
      toast({
        title: "Failed to update user",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" py={12}>
        <Spinner />
      </Flex>
    );
  }

  if (!user) {
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
            <Text fontWeight="600">User not found</Text>
            <Text color="gray.500" mt={1}>
              The requested user could not be loaded.
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
            <Heading size="lg">{user.username}</Heading>
            <Text color="gray.500" mt={1}>
              User details and audit information
            </Text>
          </Box>
        </HStack>

        <HStack spacing={3}>
          <Button
            leftIcon={<RefreshCw size={16} />}
            variant="outline"
            onClick={fetchUser}
            isLoading={loading}
          >
            Refresh
          </Button>

          <Button leftIcon={<Pencil size={16} />} onClick={editModal.onOpen}>
            Edit User
          </Button>
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
                <UserIcon size={22} />
              </Flex>

              <Box>
                <Heading size="md">{user.username}</Heading>
                <Text color="gray.500">{user.email || "No email"}</Text>
              </Box>
            </HStack>

            <HStack spacing={3} flexWrap="wrap">
              <ScopeBadge scope={user.scope} />
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
                  Identity
                </Heading>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                  <DetailItem label="User ID" value={user.id} />
                  <DetailItem label="Username" value={user.username} />
                  <DetailItem label="Email" value={user.email || "—"} />
                  <DetailItem
                    label="Scope"
                    value={<ScopeBadge scope={user.scope} />}
                  />
                  <DetailItem label="Tenant ID" value={user.tenantId ?? "—"} />
                  <DetailItem label="Version" value={user.version ?? "—"} />
                </Grid>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Heading size="sm" mb={4}>
                  Roles
                </Heading>

                <RoleBadges roles={user.roles} />
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
                  value={formatDateTime(user.createdAt)}
                />
                <Divider />
                <DetailItem label="Created By" value={user.createdBy || "—"} />
                <Divider />
                <DetailItem
                  label="Updated At"
                  value={formatDateTime(user.updatedAt)}
                />
                <Divider />
                <DetailItem label="Updated By" value={user.updatedBy || "—"} />
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <UserEditModal
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
        user={user}
        onSave={handleSave}
        isSubmitting={submitting}
      />
    </Stack>
  );
}
