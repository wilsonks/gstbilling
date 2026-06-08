import React from "react";

import {
  Card,
  CardBody,
  Divider,
  Flex,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from "@chakra-ui/react";

import {
  FileText,
  Receipt,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

function BreakdownRow({ icon, label, count, amount }) {
  const Icon = icon;

  return (
    <Flex justify="space-between" align="center" py={2} w="100%">
      <HStack spacing={3}>
        <Icon size={18} />

        <VStack align="start" spacing={0}>
          <Text fontWeight="medium" fontSize="sm">
            {label}
          </Text>

          <Text fontSize="xs" color="gray.500">
            {count} documents
          </Text>
        </VStack>
      </HStack>

      <Text fontWeight="semibold" fontSize="sm">
        ₹ {Number(amount || 0).toLocaleString()}
      </Text>
    </Flex>
  );
}

export default function DashboardDocumentBreakdownCard({
  summary,
  loading = false,
}) {
  if (loading) {
    return (
      <Card
        bg="white"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="xl"
        boxShadow="sm"
      >
        <CardBody>
          <Text>Loading...</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      boxShadow="sm"
    >
      <CardBody>
        <Stat mb={4}>
          <StatLabel color="gray.500" fontSize="sm">
            Document Breakdown
          </StatLabel>

          <StatNumber fontSize="2xl" mt={2}>
            {(
              (summary?.taxInvoiceCount || 0) +
              (summary?.proformaInvoiceCount || 0) +
              (summary?.creditNoteCount || 0) +
              (summary?.debitNoteCount || 0)
            ).toLocaleString()}
          </StatNumber>

          <Text mt={1} color="gray.500" fontSize="sm">
            Total business documents
          </Text>
        </Stat>

        <Divider mb={3} />

        <VStack spacing={1} align="stretch">
          <BreakdownRow
            icon={Receipt}
            label="Tax Invoices"
            count={summary?.taxInvoiceCount}
            amount={summary?.taxInvoiceValue}
          />

          <BreakdownRow
            icon={FileText}
            label="Proforma Invoices"
            count={summary?.proformaInvoiceCount}
            amount={summary?.proformaInvoiceValue}
          />

          <BreakdownRow
            icon={ArrowDownCircle}
            label="Credit Notes"
            count={summary?.creditNoteCount}
            amount={summary?.creditNoteValue}
          />

          <BreakdownRow
            icon={ArrowUpCircle}
            label="Debit Notes"
            count={summary?.debitNoteCount}
            amount={summary?.debitNoteValue}
          />
        </VStack>
      </CardBody>
    </Card>
  );
}
