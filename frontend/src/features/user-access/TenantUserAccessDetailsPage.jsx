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
import { getTenantUserAccessById } from "./tenantUserAccessApi";

export default function TenantUserAccessDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setRecord(await getTenantUserAccessById(id));
      } catch (error) {
        toast({
          title: "Failed to load user access",
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
  if (!record) return <Text>User access record not found.</Text>;

  return (
    <Stack spacing={6}>
      <Button onClick={() => navigate("/user-access")} width="fit-content">
        Back
      </Button>

      <Card>
        <CardBody>
          <Heading size="md" mb={4}>User Access #{record.id}</Heading>
          <Stack spacing={3}>
            <Text><strong>User:</strong> {record.username || "—"}</Text>
            <Divider />
            <Text><strong>Email:</strong> {record.userEmail || "—"}</Text>
            <Divider />
            <Text><strong>Company:</strong> {record.companyName || "—"}</Text>
            <Divider />
            <Text><strong>GSTIN:</strong> {record.companyGstin || "—"}</Text>
            <Divider />
            <Text><strong>Role:</strong> {record.role || "—"}</Text>
            <Divider />
            <Text><strong>Status:</strong> {record.active ? "ACTIVE" : "INACTIVE"}</Text>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}