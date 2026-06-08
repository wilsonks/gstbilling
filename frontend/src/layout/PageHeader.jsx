import React from "react";

import { Box, Flex, Heading, Text, HStack } from "@chakra-ui/react";

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <Flex
      justify="space-between"
      align={{
        base: "flex-start",
        lg: "center",
      }}
      direction={{
        base: "column",
        lg: "row",
      }}
      gap={4}
      mb={6}
    >
      <Box>
        <Heading size="lg" color="gray.700">
          {title}
        </Heading>

        {subtitle && (
          <Text mt={1} color="gray.500" fontSize="sm">
            {subtitle}
          </Text>
        )}
      </Box>

      {actions && (
        <HStack
          spacing={3}
          flexWrap="wrap"
          justify={{
            base: "flex-start",
            lg: "flex-end",
          }}
        >
          {actions}
        </HStack>
      )}
    </Flex>
  );
}
