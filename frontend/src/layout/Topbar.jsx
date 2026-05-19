import React from "react";

import { Flex, IconButton, Text, Button, HStack, Box } from "@chakra-ui/react";

import { HamburgerIcon } from "@chakra-ui/icons";
import { useDispatch, useSelector } from "react-redux";

import { logoutUser } from "../features/auth/authThunks";
import CompanySwitcher from "../features/company/CompanySwitcher";

export default function Topbar({ onOpen }) {
  const dispatch = useDispatch();

  const companyId = useSelector((s) => s.company.selected);
  const companies = useSelector((s) => s.company.list);

  const selectedCompany = companies?.find((c) =>
    typeof c === "object" ? c.companyId === companyId : c === companyId,
  );

  return (
    <Flex
      px={4}
      py={3}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      justify="space-between"
      align="center"
      position="sticky"
      top="0"
      zIndex="1000"
    >
      <HStack>
        <IconButton
          icon={<HamburgerIcon />}
          display={{ base: "inline-flex", md: "none" }}
          onClick={onOpen}
        />

        <Text fontWeight="bold">GST Billing</Text>
      </HStack>

      <HStack spacing={4}>
        <Box display={{ base: "none", sm: "block" }}>
          <CompanySwitcher />
        </Box>

        <Text fontSize="sm" display={{ base: "none", md: "block" }}>
          {selectedCompany?.name || companyId}
        </Text>

        <Button size="sm" onClick={() => dispatch(logoutUser())}>
          Logout
        </Button>
      </HStack>
    </Flex>
  );
}
