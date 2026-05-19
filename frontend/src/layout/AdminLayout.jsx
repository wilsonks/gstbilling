import React from "react";
import { Flex, Box, useDisclosure } from "@chakra-ui/react";

import AdminSidebar from "./AdminSidebar";
import MobileAdminDrawer from "./MobileAdminDrawer";
import AdminTopbar from "./AdminTopbar";
import BottomNav from "./BottomNav";
import PageContainer from "./PageContainer";

export default function AdminLayout({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* Desktop Sidebar */}
      <Box display={{ base: "none", md: "block" }}>
        <AdminSidebar />
      </Box>

      {/* Mobile Drawer */}
      <MobileAdminDrawer isOpen={isOpen} onClose={onClose} />

      {/* Main */}
      <Flex direction="column" flex="1">
        <AdminTopbar onOpen={onOpen} />

        <PageContainer>{children}</PageContainer>

        <BottomNav type="admin" />
      </Flex>
    </Flex>
  );
}