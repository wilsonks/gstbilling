import React, { useEffect, useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Button,
  Box,
  Input,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Text,
  Badge,
  HStack,
} from "@chakra-ui/react";
import api from "../../services/api";

export default function TenantsAdminPanel() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: "",
    tenantId: "",
  });

  const fetchTenants = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/api/platform/tenants?q=${encodeURIComponent(search)}&page=${page - 1}&size=10`,
      );

      const data = res.data?.content || [];
      setTenants(data);
      setHasNextPage(!res.data?.last && data.length === 10);
    } catch (e) {
      setTenants([]);
      setHasNextPage(false);
      toast({
        title: "Failed to load tenants",
        description: e.response?.data?.message || "Unable to fetch tenants",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [search, page]);

  const handleCreate = async () => {
    if (!newTenant.name.trim()) {
      toast({
        title: "Name is required",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/api/platform/tenants", {
        name: newTenant.name.trim(),
        tenantId: newTenant.tenantId.trim() || undefined,
      });

      toast({
        title: "Tenant created",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      setNewTenant({ name: "", tenantId: "" });
      onClose();
      fetchTenants();
    } catch (e) {
      toast({
        title: "Create failed",
        description: e.response?.data?.message || "Unable to create tenant",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTenant = async (tenant) => {
    try {
      await api.post(
        `/api/platform/tenants/${tenant.tenantId}/${tenant.active ? "deactivate" : "reactivate"}`,
      );

      toast({
        title: tenant.active ? "Tenant deactivated" : "Tenant reactivated",
        status: "info",
        duration: 2500,
        isClosable: true,
      });

      fetchTenants();
    } catch (e) {
      toast({
        title: "Update failed",
        description: e.response?.data?.message || "Unable to update tenant",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <HStack mb={3} spacing={3} align="center" flexWrap="wrap">
        <Input
          placeholder="Search tenants..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          width="300px"
          bg="white"
        />
        <Button colorScheme="blue" onClick={onOpen}>
          Create Tenant
        </Button>
      </HStack>

      <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
        {loading ? (
          <Box p={6} textAlign="center">
            <Spinner />
          </Box>
        ) : (
          <Table size="sm" variant="striped">
            <Thead>
              <Tr>
                <Th>Tenant ID</Th>
                <Th>Name</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tenants.map((tenant) => (
                <Tr key={tenant.tenantId}>
                  <Td>{tenant.tenantId}</Td>
                  <Td>{tenant.name}</Td>
                  <Td>
                    <Badge colorScheme={tenant.active ? "green" : "red"}>
                      {tenant.active ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      size="xs"
                      colorScheme={tenant.active ? "red" : "green"}
                      onClick={() => handleToggleTenant(tenant)}
                    >
                      {tenant.active ? "Deactivate" : "Activate"}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        {!loading && tenants.length === 0 && (
          <Text p={4} color="gray.500">
            No tenants found.
          </Text>
        )}
      </Box>

      <HStack mt={4} justify="space-between">
        <Button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          isDisabled={page === 1}
        >
          Previous
        </Button>
        <Text fontSize="sm">Page {page}</Text>
        <Button onClick={() => setPage((prev) => prev + 1)} isDisabled={!hasNextPage}>
          Next
        </Button>
      </HStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Tenant</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Tenant Name</FormLabel>
              <Input
                value={newTenant.name}
                onChange={(e) =>
                  setNewTenant((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter tenant name"
              />
            </FormControl>

            <FormControl mt={3}>
              <FormLabel>Tenant ID</FormLabel>
              <Input
                value={newTenant.tenantId}
                onChange={(e) =>
                  setNewTenant((prev) => ({ ...prev, tenantId: e.target.value }))
                }
                placeholder="Optional custom tenant ID"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreate} isLoading={submitting}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}