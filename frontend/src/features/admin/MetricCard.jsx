import { Box, Text, Heading } from "@chakra-ui/react";

export default function MetricCard({ label, value }) {
  return (
    <Box
      bg="white"
      p={5}
      borderRadius="lg"
      boxShadow="sm"
    >
      <Text fontSize="sm" color="gray.500">
        {label}
      </Text>

      <Heading size="md">{value}</Heading>
    </Box>
  );
}