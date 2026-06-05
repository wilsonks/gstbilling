import React from "react";

import { Box, Text, VStack } from "@chakra-ui/react";

export default function ValidationSummary({ result }) {
  if (!result) {
    return null;
  }

  return (
    <Box>
      <VStack align="start">
        <Text>Total Rows: {result.totalRows}</Text>

        <Text color="green.500">Valid Rows: {result.validRows}</Text>

        <Text color="red.500">Invalid Rows: {result.invalidRows}</Text>
      </VStack>
    </Box>
  );
}
