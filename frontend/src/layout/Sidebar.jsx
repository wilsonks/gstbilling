import React from "react";

import { Box, VStack, Text, Divider, HStack, Avatar } from "@chakra-ui/react";

import {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  KeyRound,
  FileText,
  ReceiptText,
  BadgeIndianRupee,
  Hash,
  ShieldCheck,
  LogOut,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { logoutUser } from "../features/auth/authThunks";

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();

  const location = useLocation();

  const dispatch = useDispatch();

  const auth = useSelector((s) => s.auth);

  const go = (path) => {
    navigate(path);

    onNavigate?.();
  };

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const Item = ({ label, path, icon: Icon }) => {
    const active = isActive(path);

    return (
      <HStack
        px={4}
        py={3}
        spacing={3}
        borderRadius="lg"
        cursor="pointer"
        bg={active ? "blue.50" : "transparent"}
        color={active ? "blue.600" : "gray.700"}
        fontWeight={active ? "600" : "400"}
        _hover={{
          bg: "gray.100",
        }}
        onClick={() => go(path)}
      >
        <Icon size={18} />

        <Text fontSize="sm">{label}</Text>
      </HStack>
    );
  };

  return (
    <Box
      w="280px"
      h="100vh"
      overflowY="auto"
      position="sticky"
      top="0"
      bg="white"
      borderRight="1px solid"
      borderColor="gray.200"
      p={4}
      display="flex"
      flexDirection="column"
    >
      {/* Header */}

      <Box mb={6}>
        <Text fontWeight="800" fontSize="lg" color="blue.600">
          GST Billing
        </Text>

        <Text fontSize="xs" color="gray.500">
          Business Management
        </Text>
      </Box>

      {/* Navigation */}

      <Box flex="1">
        <Text color="gray.500" fontSize="xs" mb={2}>
          OVERVIEW
        </Text>

        <VStack align="stretch" spacing={1} mb={5}>
          <Item label="Dashboard" path="/dashboard" icon={LayoutDashboard} />
        </VStack>

        <Divider my={4} />

        <Text color="gray.500" fontSize="xs" mb={2}>
          MASTER DATA
        </Text>

        <VStack align="stretch" spacing={1} mb={5}>
          <Item label="Companies" path="/companies" icon={Building2} />

          <Item label="Products" path="/products" icon={Package} />

          <Item label="Customers" path="/customers" icon={Users} />

          <Item label="Sequences" path="/invoice-sequences" icon={Hash} />

          <Item label="Users" path="/users" icon={Users} />

          <Item label="User Access" path="/user-access" icon={ShieldCheck} />
        </VStack>

        <Divider my={4} />

        <Text color="gray.500" fontSize="xs" mb={2}>
          TRANSACTIONS
        </Text>

        <VStack align="stretch" spacing={1}>
          <Item label="Tax Invoices" path="/invoices" icon={FileText} />

          <Item
            label="Proforma Invoices"
            path="/proforma-invoices"
            icon={ReceiptText}
          />

          <Item
            label="Credit Notes"
            path="/credit-notes"
            icon={BadgeIndianRupee}
          />

          <Item
            label="Debit Notes"
            path="/debit-notes"
            icon={BadgeIndianRupee}
          />
        </VStack>
      </Box>

      {/* Footer */}

      <Box pt={4}>
        <Divider mb={4} />

        <HStack spacing={3} px={2} mb={4}>
          <Avatar size="sm" name={auth?.username} />

          <Box>
            <Text fontSize="sm" fontWeight="600">
              {auth?.username}
            </Text>

            <Text fontSize="xs" color="gray.500">
              Tenant User
            </Text>
          </Box>
        </HStack>

        <Text color="gray.500" fontSize="xs" mb={2}>
          SETTINGS
        </Text>

        <VStack align="stretch" spacing={1}>
          <Item
            label="Change Password"
            path="/change-password"
            icon={KeyRound}
          />

          <HStack
            px={4}
            py={3}
            spacing={3}
            borderRadius="lg"
            cursor="pointer"
            color="red.600"
            _hover={{
              bg: "red.50",
            }}
            onClick={() => dispatch(logoutUser())}
          >
            <LogOut size={18} />

            <Text fontSize="sm">Logout</Text>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
