import React, { useEffect, useState } from "react";
import {
  Box,
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
import { getCompanyById } from "./companyApi";

export default function TenantCompanyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setCompany(await getCompanyById(id));
      } catch (error) {
        toast({
          title: "Failed to load company",
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

  if (!company) return <Text>Company not found.</Text>;

  return (
    <Stack spacing={6}>
      <Button onClick={() => navigate("/companies")} width="fit-content">
        Back
      </Button>

      <Card>
        <CardBody>
          <Heading size="md" mb={4}>{company.name}</Heading>
          <Stack spacing={3}>
            <Text><strong>GSTIN:</strong> {company.gstin || "—"}</Text>
            <Divider />
            <Text><strong>Legal Name:</strong> {company.legalName || "—"}</Text>
            <Divider />
            <Text><strong>Trade Name:</strong> {company.tradeName || "—"}</Text>
            <Divider />
            <Text><strong>Email:</strong> {company.email || "—"}</Text>
            <Divider />
            <Text><strong>Phone:</strong> {company.phone || "—"}</Text>
            <Divider />
            <Text><strong>Type:</strong> {company.type || "—"}</Text>
            <Divider />
            <Text><strong>Status:</strong> {company.active ? "ACTIVE" : "INACTIVE"}</Text>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}