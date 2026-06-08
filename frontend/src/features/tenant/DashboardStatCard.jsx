import React from "react";

import {
  Card,
  CardBody,
  HStack,
  Skeleton,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";

export default function DashboardStatCard({
  label,
  value,
  helpText,
  icon,
  loading = false,
}) {
  return (
    <Card
      bgGradient="linear(to-br, white, gray.50)"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="2xl"
      shadow="sm"
      transition="all 0.2s"
      _hover={{
        transform: "translateY(-2px)",
        shadow: "md",
      }}
    >
      <CardBody>
        <Stat>
          <HStack justify="space-between" mb={2}>
            <StatLabel color="gray.500">{label}</StatLabel>

            {icon}
          </HStack>

          <StatNumber fontSize="2xl">
            {loading ? <Skeleton height="32px" /> : value}
          </StatNumber>

          <StatHelpText mb={0}>
            {loading ? <Skeleton height="16px" /> : helpText}
          </StatHelpText>
        </Stat>
      </CardBody>
    </Card>
  );
}
