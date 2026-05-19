import React from "react";
import { Box } from "@chakra-ui/react";
import Breadcrumbs from "./Breadcrumbs";

export default function PageContainer({ children }) {
  return (
    <Box
      flex="1"
      overflowX="hidden"
      p={{ base: 3, md: 6 }}
      pb={{ base: "80px", md: 6 }} // bottom nav spacing
    >
      <Breadcrumbs />

      {children}
    </Box>
  );
}