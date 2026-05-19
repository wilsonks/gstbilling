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
  HStack,
} from "@chakra-ui/react";
import api from "../../services/api";

export default function CompaniesAdminPanel() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    gstin: "",
    email: "",
    phone: "",
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/api/companies?q=${encodeURIComponent(search)}&page=${page - 1}&size=10`,
      );

      const data = res.data?.content || res.data || [];
      const normalized = Array.isArray(data) ? data : [];
      setCompanies(normalized);
      setHasNextPage(Array.isArray(res.data?.content) ? !res.data?.last : normalized.length === 10);
    } catch (e) {
      setCompanies([]);
      setHasNextPage(false);
      toast({
        title: "Failed to load companies",
        description: e.response?.data?.message || "Unable to fetch companies",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search, page]);

  const handleCreate = async () => {
    if (!newCompany.name.trim()) {
      toast({
        title: "Company name is required",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/api/companies", {
        name: newCompany.name.trim(),
        gstin: newCompany.gstin.trim(),
        email: newCompany.email.trim(),
        phone: newCompany.phone.trim(),
      });

      toast({
        title: "Company created",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      setNewCompany({
        name: "",
        gstin: "",
        email: "",
        phone: "",
      });
      onClose();
      fetchCompanies();
    } catch (e) {
      toast({
        title: "Create failed",
        description: e.response?.data?.message || "Unable to create company",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (companyId) => {
    try {
      await api.delete(`/api/companies/${companyId}`);
      toast({
        title: "Company deactivated",
        status: "info",
        duration: 2500,
        isClosable: true,
      });
      fetchCompanies();
    } catch (e) {
      toast({
        title: "Deactivate failed",
        description: e.response?.data?.message || "Unable to deactivate company",
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
          placeholder="Search companies..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          width="300px"
          bg="white"
        />
        <Button colorScheme="blue" onClick={onOpen}>
          Create Company
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
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>GSTIN</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {companies.map((company) => (
                <Tr key={company.id}>
                  <Td>{company.id}</Td>
                  <Td>{company.name}</Td>
                  <Td>{company.gstin || "-"}</Td>
                  <Td>{company.email || "-"}</Td>
                  <Td>{company.phone || "-"}</Td>
                  <Td>
                    <Button
                      size="xs"
                      colorScheme="red"
                      onClick={() => handleDeactivate(company.id)}
                    >
                      Deactivate
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        {!loading && companies.length === 0 && (
          <Text p={4} color="gray.500">
            No companies found.
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
          <ModalHeader>Create Company</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Company Name</FormLabel>
              <Input
                value={newCompany.name}
                onChange={(e) =>
                  setNewCompany((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter company name"
              />
            </FormControl>

            <FormControl mt={3}>
              <FormLabel>GSTIN</FormLabel>
              <Input
                value={newCompany.gstin}
                onChange={(e) =>
                  setNewCompany((prev) => ({ ...prev, gstin: e.target.value }))
                }
                placeholder="Enter GSTIN"
              />
            </FormControl>

            <FormControl mt={3}>
              <FormLabel>Email</FormLabel>
              <Input
                value={newCompany.email}
                onChange={(e) =>
                  setNewCompany((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Enter email"
              />
            </FormControl>

            <FormControl mt={3}>
              <FormLabel>Phone</FormLabel>
              <Input
                value={newCompany.phone}
                onChange={(e) =>
                  setNewCompany((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="Enter phone"
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