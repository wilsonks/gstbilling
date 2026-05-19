import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  HStack,
  Box,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";

export default function TenantTable({ tenants }) {
  const navigate = useNavigate();

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
            <Th>GSTIN</Th>
            <Th>Users</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>

        <Tbody>
          {tenants.map((t) => (
            <Tr
              key={t.id}
              cursor="pointer"
              _hover={{ bg: "gray.50" }}
              onClick={() =>
                navigate(`/admin/tenants/${t.id}`)
              }
            >
              <Td>{t.name}</Td>

              <Td>{t.gstin}</Td>

              <Td>{t.users}</Td>

              <Td>
                <Badge
                  colorScheme={
                    t.status === "ACTIVE"
                      ? "green"
                      : "red"
                  }
                >
                  {t.status}
                </Badge>
              </Td>

              <Td onClick={(e) => e.stopPropagation()}>
                <HStack spacing={2}>
                  <Button
                    size="xs"
                    onClick={() =>
                      navigate(
                        `/admin/tenants/${t.id}`,
                      )
                    }
                  >
                    View
                  </Button>

                  <Button
                    size="xs"
                    colorScheme="blue"
                  >
                    Impersonate
                  </Button>

                  <Button
                    size="xs"
                    colorScheme="red"
                  >
                    Disable
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