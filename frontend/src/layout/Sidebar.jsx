import React from "react";
import { Box, VStack, Text, Divider } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (path) => {
    navigate(path);
    onNavigate?.();
  };

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const Item = ({ label, path }) => {
    const active = isActive(path);

    return (
      <Box
        px={4}
        py={3}
        borderRadius="md"
        cursor="pointer"
        bg={active ? "blue.100" : "transparent"}
        _hover={{ bg: "gray.100" }}
        onClick={() => go(path)}
      >
        <Text fontWeight={active ? "600" : "400"}>{label}</Text>
      </Box>
    );
  };

  return (
    <Box
      w="260px"
      minH="100vh"
      bg="white"
      borderRight="1px solid"
      borderColor="gray.200"
      p={4}
    >
      <Text fontWeight="bold" mb={6}>
        GST Billing
      </Text>

      <Text color="gray.500" fontSize="xs" mb={2}>
        OVERVIEW
      </Text>
      <VStack align="stretch" spacing={2} mb={4}>
        <Item label="Dashboard" path="/dashboard" />
      </VStack>

      <Divider my={4} />

      <Text color="gray.500" fontSize="xs" mb={2}>
        MASTER DATA
      </Text>
      <VStack align="stretch" spacing={2} mb={4}>
        <Item label="Companies" path="/companies" />
        <Item label="Users" path="/users" />
        <Item label="User Access" path="/user-access" />
        <Item label="Products" path="/products" />
        <Item label="Customers" path="/customers" />
        <Item label="Invoice Sequences" path="/invoice-sequences" />
      </VStack>

      <Divider my={4} />

      <Text color="gray.500" fontSize="xs" mb={2}>
        TRANSACTIONS
      </Text>
      <VStack align="stretch" spacing={2}>
        <Item label="Tax Invoices" path="/invoices" />
        <Item label="Proforma Invoices" path="/proforma-invoices" />
        <Item label="Credit Notes" path="/credit-notes" />
        <Item label="Debit Notes" path="/debit-notes" />
      </VStack>
    </Box>
  );
}