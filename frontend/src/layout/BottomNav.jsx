import React from "react";
import { Flex, Box, Text } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  ReceiptText,
  Package,
  Users,
  LayoutDashboard,
  Building2,
  UserCog,
  BadgeIndianRupee,
} from "lucide-react";

const tenantItems = [
  { label: "Home", path: "/dashboard", icon: Home },
  { label: "Invoices", path: "/invoices", icon: FileText },
  { label: "Proforma", path: "/proforma-invoices", icon: ReceiptText },
  { label: "Credit", path: "/credit-notes", icon: BadgeIndianRupee },
  { label: "Debit", path: "/debit-notes", icon: BadgeIndianRupee },
];

const adminItems = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Tenants", path: "/admin/tenants", icon: Building2 },
  { label: "Users", path: "/admin/users", icon: UserCog },
];

const hiddenRoutes = [
  "/invoices/new",
  "/proforma-invoices/new",
  "/credit-notes/new",
  "/debit-notes/new",
];

export default function BottomNav({ type = "tenant" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const items = type === "admin" ? adminItems : tenantItems;

  const shouldHide = hiddenRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  if (shouldHide) return null;

  const isActive = (path) => {
    if (path === "/dashboard" || path === "/admin") {
      return location.pathname === path;
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <Flex
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      display={{ base: "flex", md: "none" }}
      zIndex="1000"
    >
      {items.map((item) => {
        const active = isActive(item.path);
        const Icon = item.icon;

        return (
          <Box
            key={item.path}
            flex="1"
            textAlign="center"
            py={2}
            cursor="pointer"
            onClick={() => navigate(item.path)}
          >
            <Icon size={18} color={active ? "#3182ce" : "#718096"} />

            <Text
              fontSize="xs"
              mt={1}
              color={active ? "blue.600" : "gray.500"}
              fontWeight={active ? "600" : "400"}
            >
              {item.label}
            </Text>
          </Box>
        );
      })}
    </Flex>
  );
}