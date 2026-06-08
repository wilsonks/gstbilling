import React from "react";
import {
  Card,
  CardBody,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";

export default function MetricCard({
  label,
  value,
  helpText,
  loading = false,
}) {
  return (
    <Card
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      boxShadow="sm"
    >
      <CardBody>
        <Stat>
          <StatLabel color="gray.500">{label}</StatLabel>

          <StatNumber fontSize="2xl">
            {loading ? <Skeleton height="30px" width="100px" /> : value}
          </StatNumber>

          <StatHelpText mb="0">
            {loading ? <Skeleton height="16px" width="160px" /> : helpText}
          </StatHelpText>
        </Stat>
      </CardBody>
    </Card>
  );
}
