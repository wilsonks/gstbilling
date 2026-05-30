import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Divider,
  Heading,
  Spinner,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { getTenantUserById } from "./tenantUserApi";

export default function TenantUserDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setUser(await getTenantUserById(id));
      } catch (error) {
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
    run();
  }, [id]);

  if (loading) return <Spinner />;
  if (!user) return <Text>User not found.</Text>;

  return (
    <Stack spacing={6}>
      <Button onClick={() => navigate("/users")} width="fit-content">
        Back
      </Button>

      <Card>
        <CardBody>
          <Heading size="md" mb={4}>{user.username}</Heading>
          <Stack spacing={3}>
            <Text><strong>Email:</strong> {user.email || "—"}</Text>
            <Divider />
            <Text><strong>Roles:</strong> {(user.roles || []).join(", ") || "—"}</Text>
            <Divider />
            <Text><strong>Scope:</strong> {user.scope || "—"}</Text>
            <Divider />
            <Text><strong>Status:</strong> {user.active ? "ACTIVE" : "INACTIVE"}</Text>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}