import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  Box,
} from "@chakra-ui/react";

export default function UsersTable({ users }) {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      overflowX="auto"
    >
      <Table size="sm">
        <Thead bg="gray.50">
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>

        <Tbody>
          {users.map((u) => (
            <Tr key={u.id}>
              <Td>{u.name}</Td>

              <Td>{u.email}</Td>

              <Td>{u.role}</Td>

              <Td>
                <HStack spacing={2}>
                  <Button size="xs">
                    Edit
                  </Button>

                  <Button
                    size="xs"
                    colorScheme="red"
                  >
                    Remove
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}