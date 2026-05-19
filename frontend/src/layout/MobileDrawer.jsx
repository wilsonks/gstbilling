import React from "react";
import {
  Box,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  DrawerCloseButton,
  VStack,
  Divider,
  Text,
} from "@chakra-ui/react";

import Sidebar from "./Sidebar";
import CompanySwitcher from "../features/company/CompanySwitcher";

export default function MobileDrawer({ isOpen, onClose }) {
  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay />

      <DrawerContent maxW="260px">
        <DrawerCloseButton />

        <DrawerBody p={0}>
          <VStack align="stretch" spacing={0}>
            <Box p={4}>
              <Text fontSize="xs" color="gray.500" mb={2}>
                ACTIVE COMPANY
              </Text>

              <CompanySwitcher />
            </Box>

            <Divider />

            <Box p={2}>
              <Sidebar onNavigate={onClose} />
            </Box>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}