import React from "react";
import {
  Box,
  Grid,
  GridItem,
  Text,
  Heading,
  Flex,
  Button,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const accessToken = useSelector((state) => state.auth.accessToken);
  const scope = useSelector((state) => state.auth.scope);
  const companyId = useSelector((state) => state.company.selected);
  const username = useSelector((state) => state.auth.username);
  const role = useSelector((state) => state.auth.role);

  // Tenant-only page guard
  if (!accessToken || scope !== "TENANT") {
    return <Navigate to="/" replace />;
  }

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Box>
          <Heading size="lg">Dashboard</Heading>
          <Text fontSize="sm" color="gray.500">
            Welcome {username || "User"}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Company: {companyId || "-"}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Role: {role || "-"}
          </Text>
        </Box>
      </Flex>

      <Grid
        templateColumns="repeat(auto-fit, minmax(220px, 1fr))"
        gap={6}
        mb={8}
      >
        <GridItem bg="white" p={5} borderRadius="lg" boxShadow="md">
          <Text fontSize="sm" color="gray.500">
            Total Sales
          </Text>
          <Heading size="md">₹0</Heading>
        </GridItem>

        <GridItem bg="white" p={5} borderRadius="lg" boxShadow="md">
          <Text fontSize="sm" color="gray.500">
            Total Purchases
          </Text>
          <Heading size="md">₹0</Heading>
        </GridItem>

        <GridItem bg="white" p={5} borderRadius="lg" boxShadow="md">
          <Text fontSize="sm" color="gray.500">
            GST Payable
          </Text>
          <Heading size="md">₹0</Heading>
        </GridItem>

        <GridItem bg="white" p={5} borderRadius="lg" boxShadow="md">
          <Text fontSize="sm" color="gray.500">
            ITC Available
          </Text>
          <Heading size="md">₹0</Heading>
        </GridItem>
      </Grid>

      <Heading size="md" mb={4}>
        Quick Actions
      </Heading>

      <Grid templateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={6}>
        <GridItem bg="white" p={5} borderRadius="lg" boxShadow="md">
          <Heading size="sm" mb={2}>
            Create Invoice
          </Heading>
          <Text fontSize="sm" color="gray.500" mb={3}>
            Generate sales invoice with GST
          </Text>
          <Button colorScheme="blue" onClick={() => navigate("/invoice/new")}>
            Create
          </Button>
        </GridItem>

        <GridItem bg="white" p={5} borderRadius="lg" boxShadow="md">
          <Heading size="sm" mb={2}>
            Manage Parties
          </Heading>
          <Text fontSize="sm" color="gray.500" mb={3}>
            Customers / Vendors
          </Text>
          <Button onClick={() => navigate("/parties")}>Open</Button>
        </GridItem>

        <GridItem bg="white" p={5} borderRadius="lg" boxShadow="md">
          <Heading size="sm" mb={2}>
            Products
          </Heading>
          <Text fontSize="sm" color="gray.500" mb={3}>
            HSN + Tax + Pricing
          </Text>
          <Button onClick={() => navigate("/products")}>Open</Button>
        </GridItem>

        <GridItem bg="white" p={5} borderRadius="lg" boxShadow="md">
          <Heading size="sm" mb={2}>
            GST Reports
          </Heading>
          <Text fontSize="sm" color="gray.500" mb={3}>
            GSTR-1, 3B
          </Text>
          <Button colorScheme="green" onClick={() => navigate("/reports")}>
            View
          </Button>
        </GridItem>
      </Grid>
    </Box>
  );
}