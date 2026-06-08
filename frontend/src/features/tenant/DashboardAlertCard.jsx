import React from "react";

import { Badge, Card, CardBody, Flex, HStack, Text } from "@chakra-ui/react";

import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

const STATUS_CONFIG = {
  warning: {
    icon: AlertTriangle,
    badgeColor: "orange",
    bg: "orange.50",
    border: "orange.200",
    label: "Attention",
  },

  success: {
    icon: CheckCircle2,
    badgeColor: "green",
    bg: "green.50",
    border: "green.200",
    label: "Healthy",
  },

  info: {
    icon: Info,
    badgeColor: "blue",
    bg: "blue.50",
    border: "blue.200",
    label: "Info",
  },
};

export default function DashboardAlertCard({
  title,
  value,
  description,
  status = "warning",
}) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.warning;

  const Icon = config.icon;

  return (
    <Card
      bg={config.bg}
      borderWidth="1px"
      borderColor={config.border}
      borderRadius="2xl"
      transition="all 0.2s"
      _hover={{
        shadow: "md",
      }}
    >
      <CardBody>
        <Flex justify="space-between" align="center" mb={3}>
          <HStack>
            <Icon size={18} />

            <Text fontWeight="semibold" fontSize="sm">
              {title}
            </Text>
          </HStack>

          <Badge colorScheme={config.badgeColor}>{config.label}</Badge>
        </Flex>

        <Text fontSize="3xl" fontWeight="bold">
          {value}
        </Text>

        <Text mt={2} fontSize="sm" color="gray.600">
          {description}
        </Text>
      </CardBody>
    </Card>
  );
}
