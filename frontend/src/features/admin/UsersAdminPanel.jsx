import React, { useEffect, useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Box,
  Input,
  Tag,
  Button,
  Text,
  useToast,
  HStack,
} from "@chakra-ui/react";
import api from "../../services/api";

export default function UsersAdminPanel() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/api/platform/users?q=${encodeURIComponent(search)}&page=${page - 1}&size=10`,
      );

      const data = res.data?.content || res.data || [];
      const normalized = Array.isArray(data) ? data : [];

      setUsers(normalized);
      setHasNextPage(Array.isArray(res.data?.content) ? !res.data?.last : normalized.length === 10);
    } catch (e) {
      setUsers([]);
      setHasNextPage(false);
      toast({
        title: "Failed to load users",
        description: e.response?.data?.message || "Unable to fetch users",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  return (
    <Box>
      <HStack mb={3} spacing={3} align="center" flexWrap="wrap">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          width="300px"
          bg="white"
        />
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
                <Th>Username</Th>
                <Th>Email</Th>
                <Th>Tenant</Th>
                <Th>Roles</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td>{user.id}</Td>
                  <Td>{user.username}</Td>
                  <Td>{user.email}</Td>
                  <Td>{user.tenantId ?? "-"}</Td>
                  <Td>
                    {(user.roles || []).map((role) => (
                      <Tag
                        key={role}
                        colorScheme={role === "SUPER_ADMIN" ? "purple" : "blue"}
                        mr={1}
                        mb={1}
                      >
                        {role}
                      </Tag>
                    ))}
                  </Td>
                  <Td>
                    <Button size="xs" variant="ghost" isDisabled>
                      Edit
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        {!loading && users.length === 0 && (
          <Text p={4} color="gray.500">
            No users found.
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
    </Box>
  );
}