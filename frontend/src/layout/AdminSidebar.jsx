import React from "react";
import { Box, VStack, Text, Divider } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminSidebar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (path) => {
    navigate(path);
    onNavigate?.();
  };

  const Item = ({ label, path }) => {
    const active =
      path === "/admin"
        ? location.pathname === "/admin"
        : location.pathname === path ||
          location.pathname.startsWith(`${path}/`);

    return (
      <Box
        px={4}
        py={3}
        borderRadius="md"
        cursor="pointer"
        bg={active ? "gray.700" : "transparent"}
        _hover={{ bg: "gray.800" }}
        onClick={() => go(path)}
      >
        <Text color="white">{label}</Text>
      </Box>
    );
  };

  return (
    <Box
      w="260px"
      position="sticky"
      top="0"
      h="100vh"
      overflowY="auto"
      bg="gray.900"
      color="white"
      p={4}
    >
      <Text fontWeight="bold" mb={6}>
        Platform Admin
      </Text>

      <Text color="gray.400" fontSize="xs" mb={2}>
        PLATFORM
      </Text>

      <VStack align="stretch" spacing={1}>
        <Item label="Overview" path="/admin" />
        <Item label="Metrics" path="/admin/metrics" />
      </VStack>

      <Divider my={4} borderColor="gray.700" />

      <Text color="gray.400" fontSize="xs" mb={2}>
        MANAGEMENT
      </Text>

      <VStack align="stretch" spacing={1}>
        <Item label="Tenants" path="/admin/tenants" />
        <Item label="Companies" path="/admin/companies" />
        <Item label="Users" path="/admin/users" />
        <Item label="User Access" path="/admin/user-access" />
        <Item label="Audit Logs" path="/admin/audit-logs" />
        <Item label="Billing" path="/admin/billing" />
      </VStack>
    </Box>
  );
}
