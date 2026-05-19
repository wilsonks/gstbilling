import React from "react";

import {
  Box,
  Heading,
  Text,
} from "@chakra-ui/react";

export default function AdminUsersPage() {
  return (
    <Box>
      <Heading size="lg" mb={4}>
        Platform Users
      </Heading>

      <Text color="gray.500">
        Manage platform users here.
      </Text>
    </Box>
  );
}