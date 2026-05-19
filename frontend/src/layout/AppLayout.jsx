import React from "react";
import { Flex, Box, useDisclosure } from "@chakra-ui/react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileDrawer from "./MobileDrawer";
import BottomNav from "./BottomNav";
import PageContainer from "./PageContainer";

export default function AppLayout({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* Desktop Sidebar */}
      <Box display={{ base: "none", md: "block" }}>
        <Sidebar />
      </Box>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={isOpen} onClose={onClose} />

      {/* Main */}
      <Flex direction="column" flex="1">
        <Topbar onOpen={onOpen} />

        <PageContainer>{children}</PageContainer>

        <BottomNav type="tenant" />
      </Flex>
    </Flex>
  );
}