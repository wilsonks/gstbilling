import React from "react";
import { Box, VStack, Text } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (path) => {
    navigate(path);
    onNavigate?.();
  };

  const Item = ({ label, path }) => {
    const active = location.pathname.startsWith(path);

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
        <Text fontWeight={active ? "600" : "400"}>
          {label}
        </Text>
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

      <VStack align="stretch" spacing={2}>
        <Item label="Dashboard" path="/dashboard" />
        <Item label="Invoices" path="/invoice" />
        <Item label="Products" path="/products" />
        <Item label="Parties" path="/parties" />
      </VStack>
    </Box>
  );
}