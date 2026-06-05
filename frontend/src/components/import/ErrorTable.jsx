import React from "react";

import { Box, Text, Stack } from "@chakra-ui/react";

export default function ErrorTable({ errors = [] }) {
  if (!errors.length) {
    return null;
  }

  return (
    <Stack spacing={2}>
      {errors.map((error, index) => (
        <Box key={index} p={3} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">Row {error.rowNumber}</Text>

          <Text>Column: {error.column}</Text>

          {error.value && <Text>Value: {error.value}</Text>}

          <Text color="red.500">{error.message}</Text>
        </Box>
      ))}
    </Stack>
  );
}
