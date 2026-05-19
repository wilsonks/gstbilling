import React from "react";
import {
  Flex,
  IconButton,
  Text,
  Button,
  HStack,
  Badge,
} from "@chakra-ui/react";

import { HamburgerIcon } from "@chakra-ui/icons";
import { useDispatch } from "react-redux";

import { logoutUser } from "../features/auth/authThunks";

export default function AdminTopbar({ onOpen }) {
  const dispatch = useDispatch();

  return (
    <Flex
      px={4}
      py={3}
      bg="gray.900"
      color="white"
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

        <Text fontWeight="bold">Platform Admin</Text>

        <Badge colorScheme="orange">LIVE</Badge>
      </HStack>

      <Button size="sm" onClick={() => dispatch(logoutUser())}>
        Logout
      </Button>
    </Flex>
  );
}
