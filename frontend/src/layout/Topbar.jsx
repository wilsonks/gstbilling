import React from "react";

import { Flex, IconButton, Text, HStack, Box, Badge } from "@chakra-ui/react";

import { HamburgerIcon } from "@chakra-ui/icons";

import { useSelector } from "react-redux";

import { useLocation } from "react-router-dom";

import CompanySwitcher from "../features/company/CompanySwitcher";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",

  "/companies": "Companies",

  "/products": "Products",

  "/customers": "Customers",

  "/invoice-sequences": "Invoice Sequences",

  "/users": "Users",

  "/user-access": "User Access",

  "/invoices": "Tax Invoices",

  "/proforma-invoices": "Proforma Invoices",

  "/credit-notes": "Credit Notes",

  "/debit-notes": "Debit Notes",
};

export default function Topbar({ onOpen }) {
  const location = useLocation();

  const companyId = useSelector((s) => s.company.selected);

  const companies = useSelector((s) => s.company.list);

  const selectedCompany = companies?.find((c) =>
    typeof c === "object" ? c.companyId === companyId : c === companyId,
  );

  const pageTitle =
    Object.entries(PAGE_TITLES).find(
      ([path]) =>
        location.pathname === path || location.pathname.startsWith(`${path}/`),
    )?.[1] || "GST Billing";

  return (
    <Flex
      px={6}
      py={3}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      justify="space-between"
      align="center"
      position="sticky"
      top="0"
      zIndex="1000"
      boxShadow="sm"
      h="64px"
    >
      <HStack spacing={4}>
        <IconButton
          icon={<HamburgerIcon />}
          display={{
            base: "inline-flex",
            md: "none",
          }}
          onClick={onOpen}
          variant="ghost"
          aria-label="Menu"
        />

        <Box>
          <Text fontSize="lg" fontWeight="700" color="gray.700" lineHeight="1">
            {pageTitle}
          </Text>

          <Text fontSize="xs" color="gray.500" mt={1}>
            GST Billing
          </Text>
        </Box>
      </HStack>

      <HStack spacing={4}>
        <Box
          display={{
            base: "none",
            md: "block",
          }}
        >
          <CompanySwitcher />
        </Box>

        {selectedCompany && (
          <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
            {selectedCompany.name}
          </Badge>
        )}
      </HStack>
    </Flex>
  );
}
