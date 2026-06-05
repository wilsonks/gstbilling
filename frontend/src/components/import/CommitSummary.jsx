import React from "react";

import { Box, Text, VStack } from "@chakra-ui/react";

export default function CommitSummary({ result }) {
  if (!result) {
    return null;
  }

  return (
    <Box>
      <VStack align="start">
        <Text>Total Rows: {result.totalRows}</Text>

        <Text color="green.500">Inserted: {result.inserted}</Text>

        <Text color="blue.500">Updated: {result.updated}</Text>

        <Text color="red.500">Failed: {result.failed}</Text>
      </VStack>
    </Box>
  );
}
