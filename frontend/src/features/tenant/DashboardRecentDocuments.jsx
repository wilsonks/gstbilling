import React from "react";

import {
  Badge,
  Card,
  CardBody,
  HStack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Box,
} from "@chakra-ui/react";

function getDocumentTypeColor(type) {
  switch (type) {
    case "TAX_INVOICE":
      return "green";

    case "PROFORMA_INVOICE":
      return "blue";

    case "CREDIT_NOTE":
      return "orange";

    case "DEBIT_NOTE":
      return "purple";

    default:
      return "gray";
  }
}

function getStatusColor(status) {
  switch (status) {
    case "ISSUED":
      return "green";

    case "CONVERTED":
      return "blue";

    case "DRAFT":
      return "orange";

    case "CANCELLED":
      return "red";

    default:
      return "gray";
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function formatDocumentType(type) {
  switch (type) {
    case "TAX_INVOICE":
      return "Tax Invoice";

    case "PROFORMA_INVOICE":
      return "Proforma";

    case "CREDIT_NOTE":
      return "Credit Note";

    case "DEBIT_NOTE":
      return "Debit Note";

    default:
      return type;
  }
}

export default function DashboardRecentDocuments({
  documents = [],
  loading = false,
}) {
  return (
    <Card
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      boxShadow="sm"
    >
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <Box>
            <Text fontSize="lg" fontWeight="bold">
              Recent Documents
            </Text>

            <Text fontSize="sm" color="gray.500">
              Latest business documents created in the system
            </Text>
          </Box>

          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Document No</Th>
                  <Th>Customer</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th isNumeric>Amount</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>

              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={8}>
                      Loading...
                    </Td>
                  </Tr>
                ) : documents.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={8}>
                      No recent documents found
                    </Td>
                  </Tr>
                ) : (
                  documents.map((document) => (
                    <Tr key={document.id}>
                      <Td>
                        <Text fontWeight="semibold">
                          {document.documentNumber}
                        </Text>
                      </Td>

                      <Td>{document.customerName}</Td>

                      <Td>
                        <Badge
                          colorScheme={getDocumentTypeColor(
                            document.documentType,
                          )}
                        >
                          {formatDocumentType(document.documentType)}
                        </Badge>
                      </Td>

                      <Td>
                        <Badge colorScheme={getStatusColor(document.status)}>
                          {document.status}
                        </Badge>
                      </Td>

                      <Td isNumeric>{formatCurrency(document.amount)}</Td>

                      <Td>{document.documentDate}</Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>

          {!loading && documents.length > 0 && (
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">
                Showing latest {documents.length} documents
              </Text>
            </HStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}
