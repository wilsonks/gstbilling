import React from "react";
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import TenantsAdminPanel from "./TenantsAdminPanel";
import CompaniesAdminPanel from "./CompaniesAdminPanel";
import UsersAdminPanel from "./UsersAdminPanel";

export default function PlatformAdminDashboard() {
  const { scope, role, username } = useSelector((state) => state.auth);

  if (scope !== "PLATFORM" || role !== "SUPER_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box p={6}>
      <Heading size="lg" mb={2}>
        Platform Admin Dashboard
      </Heading>
      <Text fontSize="sm" color="gray.500" mb={4}>
        Signed in as {username || "Platform Admin"}
      </Text>

      <Tabs isFitted variant="enclosed">
        <TabList mb="1em">
          <Tab>Tenants</Tab>
          <Tab>Companies</Tab>
          <Tab>Users</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <TenantsAdminPanel />
          </TabPanel>
          <TabPanel px={0}>
            <CompaniesAdminPanel />
          </TabPanel>
          <TabPanel px={0}>
            <UsersAdminPanel />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}