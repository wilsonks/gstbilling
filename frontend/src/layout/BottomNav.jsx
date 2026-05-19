import React from 'react'
import { Flex, Box, Text } from "@chakra-ui/react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  Home,
  FileText,
  Package,
  Users,
  LayoutDashboard,
  Building2,
  UserCog,
} from "lucide-react";

const tenantItems = [
  { label: "Home", path: "/dashboard", icon: Home },
  { label: "Invoices", path: "/invoice", icon: FileText },
  { label: "Products", path: "/products", icon: Package },
  { label: "Parties", path: "/parties", icon: Users },
];

const adminItems = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Tenants", path: "/admin/tenants", icon: Building2 },
  { label: "Users", path: "/admin/users", icon: UserCog },
];

const hiddenRoutes = ["/invoice/new"];

export default function BottomNav({ type = "tenant" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const items =
    type === "admin"
      ? adminItems
      : tenantItems;

  const shouldHide = hiddenRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  if (shouldHide) return null;

  const isActive = (path) =>
    location.pathname.startsWith(path);

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
            <Icon
              size={18}
              color={active ? "#3182ce" : "#718096"}
            />

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