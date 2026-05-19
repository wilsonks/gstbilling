import React from 'react'
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  DrawerCloseButton,
  VStack,
  Text,
  Divider,
} from "@chakra-ui/react";

import AdminSidebar from "./AdminSidebar";

export default function MobileAdminDrawer({ isOpen, onClose }) {
  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay />

      <DrawerContent bg="gray.900" color="white">
        <DrawerCloseButton />

        <DrawerBody p={0}>
          <VStack align="stretch" spacing={0}>
            <Text p={4} fontWeight="bold">
              Platform Menu
            </Text>

            <Divider borderColor="gray.700" />

            <AdminSidebar onNavigate={onClose} />
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}