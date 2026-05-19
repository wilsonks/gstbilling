import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import api from "../../services/api";
import UserCreateModal from "./UserCreateModal";
import UserEditModal from "./UserEditModal";

const DEFAULT_PAGE_SIZE = 5;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 1) return [0];

  const pages = new Set([0, totalPages - 1, currentPage]);

  if (currentPage - 1 >= 0) pages.add(currentPage - 1);
  if (currentPage + 1 < totalPages) pages.add(currentPage + 1);
  if (currentPage - 2 >= 0) pages.add(currentPage - 2);
  if (currentPage + 2 < totalPages) pages.add(currentPage + 2);

  return [...pages].sort((a, b) => a - b);
}

function ScopeBadge({ scope }) {
  return (
    <Badge colorScheme={scope === "PLATFORM" ? "purple" : "blue"}>
      {scope || "—"}
    </Badge>
  );
}

function RoleBadges({ roles }) {
  if (!roles?.length) {
    return <Text color="gray.500">—</Text>;
  }

  return (
    <HStack spacing={2} flexWrap="wrap">
      {roles.map((role) => (
        <Badge key={role} colorScheme="gray">
          {role.replaceAll("_", " ")}
        </Badge>
      ))}
    </HStack>
  );
}

export default function UserPage() {
  const toast = useToast();
  const createModal = useDisclosure();
  const editModal = useDisclosure();

  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 400);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);

  const [pageInfo, setPageInfo] = useState({
    number: 0,
    size: DEFAULT_PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    numberOfElements: 0,
  });

  const [stats, setStats] = useState({
    total: 0,
    platformUsers: 0,
    tenantUsers: 0,
    recentUsers: [],
  });

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async ({
    search = "",
    nextPage = 0,
    nextSize = size,
  } = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/api/platform/users", {
        params: {
          ...(search?.trim() ? { q: search.trim() } : {}),
          page: nextPage,
          size: nextSize,
        },
      });

      const data = res.data || {};

      setRows(data.content || []);
      setPageInfo({
        number: data.number ?? 0,
        size: data.size ?? nextSize,
        totalElements: data.totalElements ?? 0,
        totalPages: data.totalPages ?? 0,
        first: data.first ?? true,
        last: data.last ?? true,
        numberOfElements: data.numberOfElements ?? (data.content || []).length,
      });
      setPage(data.number ?? nextPage);
    } catch (error) {
      toast({
        title: "Failed to load users",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

      setRows([]);
      setPageInfo({
        number: 0,
        size: nextSize,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
        numberOfElements: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("/api/platform/users/stats");
      setStats(
        res.data || {
          total: 0,
          platformUsers: 0,
          tenantUsers: 0,
          recentUsers: [],
        },
      );
    } catch (error) {
      setStats({
        total: 0,
        platformUsers: 0,
        tenantUsers: 0,
        recentUsers: [],
      });

      toast({
        title: "Failed to load user stats",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers({
      search: debouncedQuery,
      nextPage: 0,
      nextSize: size,
    });
  }, [debouncedQuery, size]);

  const handleRefresh = async () => {
    await Promise.all([
      fetchUsers({
        search: debouncedQuery,
        nextPage: page,
        nextSize: size,
      }),
      fetchStats(),
    ]);
  };

  const handleCreateUser = async (payload) => {
    setSubmitting(true);
    try {
      await api.post("/api/platform/users", payload);

      toast({
        title: "User created",
        description: "The user was created successfully.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      createModal.onClose();

      await Promise.all([
        fetchUsers({
          search: debouncedQuery,
          nextPage: 0,
          nextSize: size,
        }),
        fetchStats(),
      ]);
    } catch (error) {
      toast({
        title: "Failed to create user",
        description:
          error?.response?.data?.message ||
          "Please check the form and try again.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (payload) => {
    if (!editingUser) return;

    setSubmitting(true);
    try {
      await api.put(`/api/platform/users/${editingUser.id}`, payload);

      toast({
        title: "User updated",
        description: "Changes saved successfully.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      editModal.onClose();
      setEditingUser(null);

      await Promise.all([
        fetchUsers({
          search: debouncedQuery,
          nextPage: page,
          nextSize: size,
        }),
        fetchStats(),
      ]);
    } catch (error) {
      toast({
        title: "Failed to update user",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    editModal.onOpen();
  };

  const handlePageChange = async (nextPage) => {
    if (nextPage < 0 || nextPage >= pageInfo.totalPages) return;

    await fetchUsers({
      search: debouncedQuery,
      nextPage,
      nextSize: size,
    });
  };

  const handlePageSizeChange = (e) => {
    const nextSize = Number(e.target.value);
    setSize(nextSize);
    setPage(0);
  };

  const visiblePageNumbers = useMemo(
    () => getPageNumbers(pageInfo.number, pageInfo.totalPages),
    [pageInfo.number, pageInfo.totalPages],
  );

  const userRows = useMemo(() => rows || [], [rows]);

  const from =
    pageInfo.totalElements === 0 ? 0 : pageInfo.number * pageInfo.size + 1;

  const to =
    pageInfo.totalElements === 0
      ? 0
      : pageInfo.number * pageInfo.size + pageInfo.numberOfElements;

  return (
    <Stack spacing={6}>
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Box>
          <Heading size="lg">Users</Heading>
          <Text color="gray.500" mt={1}>
            Manage platform and tenant users.
          </Text>
        </Box>

        <HStack spacing={3} flexWrap="wrap">
          <Button
            leftIcon={<RefreshCw size={16} />}
            variant="outline"
            onClick={handleRefresh}
            isLoading={loading || statsLoading}
          >
            Refresh
          </Button>

          <Button leftIcon={<Plus size={16} />} onClick={createModal.onOpen}>
            Create User
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Users</StatLabel>
              <StatNumber>{statsLoading ? "—" : stats.total}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Platform Users</StatLabel>
              <StatNumber color="purple.500">
                {statsLoading ? "—" : stats.platformUsers}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Tenant Users</StatLabel>
              <StatNumber color="blue.500">
                {statsLoading ? "—" : stats.tenantUsers}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card>
        <CardBody>
          <Flex
            gap={3}
            direction={{ base: "column", md: "row" }}
            align={{ base: "stretch", md: "center" }}
            justify="space-between"
          >
            <InputGroup maxW={{ base: "100%", md: "420px" }}>
              <InputLeftElement pointerEvents="none">
                <Search size={16} color="#718096" />
              </InputLeftElement>

              <Input
                placeholder="Search by username or email"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>

            <HStack>
              <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                Rows per page
              </Text>
              <Select value={size} onChange={handlePageSizeChange} w="100px">
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </HStack>
          </Flex>
        </CardBody>
      </Card>

      <Card>
        <CardBody overflowX="auto">
          {loading ? (
            <Flex justify="center" py={10}>
              <Spinner />
            </Flex>
          ) : userRows.length === 0 ? (
            <Box py={10} textAlign="center">
              <Users size={28} style={{ margin: "0 auto 12px" }} />
              <Text fontWeight="600">No users found</Text>
              <Text color="gray.500" mt={1}>
                Create a user or adjust your search query.
              </Text>
            </Box>
          ) : (
            <>
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Username</Th>
                    <Th>Email</Th>
                    <Th>Scope</Th>
                    <Th>Tenant ID</Th>
                    <Th>Roles</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {userRows.map((user) => (
                    <Tr key={user.id}>
                      <Td>{user.id}</Td>
                      <Td>
                        <Link
                          as={RouterLink}
                          to={`/platform/users/${user.id}`}
                          color="blue.600"
                          fontWeight="600"
                          _hover={{ textDecoration: "underline" }}
                        >
                          {user.username}
                        </Link>
                      </Td>
                      <Td>{user.email || "—"}</Td>
                      <Td>
                        <ScopeBadge scope={user.scope} />
                      </Td>
                      <Td>{user.tenantId ?? "—"}</Td>
                      <Td minW="240px">
                        <RoleBadges roles={user.roles} />
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="View user">
                            <IconButton
                              as={RouterLink}
                              to={`/platform/users/${user.id}`}
                              size="sm"
                              variant="outline"
                              icon={<Eye size={14} />}
                              aria-label={`View user ${user.username}`}
                            />
                          </Tooltip>

                          <Tooltip label="Edit user">
                            <IconButton
                              size="sm"
                              variant="outline"
                              icon={<Pencil size={14} />}
                              aria-label={`Edit user ${user.username}`}
                              onClick={() => handleEditClick(user)}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              <Flex
                mt={5}
                gap={4}
                justify="space-between"
                align={{ base: "stretch", lg: "center" }}
                direction={{ base: "column", lg: "row" }}
              >
                <Text color="gray.500" fontSize="sm">
                  Showing {from}-{to} of {pageInfo.totalElements} users
                </Text>

                <Flex
                  gap={3}
                  align={{ base: "stretch", md: "center" }}
                  direction={{ base: "column", md: "row" }}
                >
                  <Text color="gray.500" fontSize="sm" whiteSpace="nowrap">
                    Page {pageInfo.number + 1} of{" "}
                    {Math.max(pageInfo.totalPages, 1)}
                  </Text>

                  <ButtonGroup size="sm" isAttached variant="outline">
                    <Button
                      onClick={() => handlePageChange(0)}
                      isDisabled={pageInfo.first}
                    >
                      <ChevronsLeft size={16} />
                    </Button>

                    <Button
                      onClick={() => handlePageChange(pageInfo.number - 1)}
                      isDisabled={pageInfo.first}
                    >
                      <ChevronLeft size={16} />
                    </Button>

                    {visiblePageNumbers.map((pageNumber, index) => {
                      const prev = visiblePageNumbers[index - 1];
                      const showGap = index > 0 && pageNumber - prev > 1;

                      return (
                        <React.Fragment key={pageNumber}>
                          {showGap && (
                            <Button isDisabled variant="ghost">
                              ...
                            </Button>
                          )}

                          <Button
                            onClick={() => handlePageChange(pageNumber)}
                            variant={
                              pageNumber === pageInfo.number
                                ? "solid"
                                : "outline"
                            }
                          >
                            {pageNumber + 1}
                          </Button>
                        </React.Fragment>
                      );
                    })}

                    <Button
                      onClick={() => handlePageChange(pageInfo.number + 1)}
                      isDisabled={pageInfo.last}
                    >
                      <ChevronRight size={16} />
                    </Button>

                    <Button
                      onClick={() => handlePageChange(pageInfo.totalPages - 1)}
                      isDisabled={pageInfo.last}
                    >
                      <ChevronsRight size={16} />
                    </Button>
                  </ButtonGroup>
                </Flex>
              </Flex>
            </>
          )}
        </CardBody>
      </Card>

      <UserCreateModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        onCreate={handleCreateUser}
        isSubmitting={submitting}
      />

      <UserEditModal
        isOpen={editModal.isOpen}
        onClose={() => {
          editModal.onClose();
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={handleUpdateUser}
        isSubmitting={submitting}
      />
    </Stack>
  );
}
