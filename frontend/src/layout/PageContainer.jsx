import React from "react";

import { Box, Container } from "@chakra-ui/react";

import Breadcrumbs from "./Breadcrumbs";

export default function PageContainer({ children }) {
  return (
    <Box
      flex="1"
      overflowX="hidden"
      bg="gray.50"
      px={{
        base: 3,
        md: 6,
      }}
      py={{
        base: 3,
        md: 5,
      }}
      pb={{
        base: "90px",
        md: 6,
      }}
    >
      <Container maxW="100%" px={0}>
        <Breadcrumbs />

        <Box mt={4}>{children}</Box>
      </Container>
    </Box>
  );
}
