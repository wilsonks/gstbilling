import React from "react";

import { Card } from "@chakra-ui/react";

export default function PageCard({ children }) {
  return (
    <Card
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      boxShadow="sm"
      overflow="hidden"
    >
      {children}
    </Card>
  );
}
