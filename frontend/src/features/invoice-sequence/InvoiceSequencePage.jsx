import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  IconButton,
  Skeleton,
  Stack,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  Edit,
  Hash,
  Plus,
  Power,
  RefreshCw,
  Upload,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import InvoiceSequenceModal from "./InvoiceSequenceModal";
import BulkImportModal from "../../components/import/BulkImportModal";
import PageHeader from "../../layout/PageHeader";
import PageCard from "../../layout/PageCard";
import MetricCard from "../../layout/MetricCard";

import {
  deactivateInvoiceSequence,
  getInvoiceSequences,
  reactivateInvoiceSequence,
  downloadInvoiceSequenceTemplate,
  exportInvoiceSequences,
  validateInvoiceSequenceImport,
  commitInvoiceSequenceImport,
  downloadInvoiceSequenceImportErrors,
} from "./invoiceSequenceApi";
import { getMyCompanies } from "../company/companyApi";

import { downloadBlob } from "../../utils/fileDownload";

function formatLabel(value) {
  return value?.replaceAll("_", " ") || "—";
}

function buildPreview(sequence) {
  const prefix = sequence.prefix || "";
  const suffix = sequence.suffix || "";
  const nextNumber = Number(sequence.currentNumber || 0) + 1;
  const padded = String(nextNumber).padStart(
    Number(sequence.paddingLength || 1),
    "0",
  );
  return `${prefix}${padded}${suffix}`;
}

const invoiceSequencePreviewColumns = [
  {
    label: "Company",
    dtoField: "companyName",
    rawField: "COMPANY_NAME",
  },

  {
    label: "Document Type",
    dtoField: "documentType",
    rawField: "DOCUMENT_TYPE",
  },

  {
    label: "Financial Year",
    dtoField: "financialYear",
    rawField: "FINANCIAL_YEAR",
  },

  {
    label: "Prefix",
    dtoField: "prefix",
    rawField: "PREFIX",
  },

  {
    label: "Padding",
    dtoField: "paddingLength",
    rawField: "PADDING_LENGTH",
  },

  {
    label: "Current Number",
    dtoField: "currentNumber",
    rawField: "CURRENT_NUMBER",
  },

  {
    label: "Reset Policy",
    dtoField: "resetPolicy",
    rawField: "RESET_POLICY",
  },

  {
    label: "Active",
    dtoField: "active",
    rawField: "ACTIVE",
    formatter: (value) => (value === true || value === "TRUE" ? "Yes" : "No"),
  },
];

const validationColumns = [
  {
    key: "rowNumber",
    label: "Row",
  },

  {
    key: "column",
    label: "Column",
  },

  {
    key: "value",
    label: "Value",
  },

  {
    key: "message",
    label: "Error",
  },
];

const summaryCards = [
  {
    label: "Total Rows",
    field: "totalRows",
  },

  {
    label: "Valid Rows",
    field: "validRows",
    color: "green",
  },

  {
    label: "Invalid Rows",
    field: "invalidRows",
    color: "red",
  },

  {
    label: "Success Rate",
    computed: (result) => {
      if (!result?.totalRows) {
        return "0%";
      }

      return `${Math.round((result.validRows / result.totalRows) * 100)}%`;
    },
  },
];

export default function InvoiceSequencePage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isImportOpen,
    onOpen: onImportOpen,
    onClose: onImportClose,
  } = useDisclosure();

  const [sequences, setSequences] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState(null);

  const handleDownloadTemplate = async () => {
    const blob = await downloadInvoiceSequenceTemplate();

    downloadBlob(blob, "invoice-sequence-template.xlsx");
  };

  const handleExport = async () => {
    const blob = await exportInvoiceSequences();

    downloadBlob(blob, "invoice-sequences.xlsx");
  };

  const loadPageData = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [sequenceData, companyData] = await Promise.all([
        getInvoiceSequences(),
        getMyCompanies(),
      ]);

      setSequences(sequenceData || []);
      setCompanies(companyData || []);
    } catch (error) {
      toast({
        title: "Failed to load invoice sequences",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const companiesById = useMemo(() => {
    return new Map(companies.map((company) => [company.id, company]));
  }, [companies]);

  const handleCreate = () => {
    setSelectedSequence(null);
    onOpen();
  };

  const handleEdit = (sequence) => {
    setSelectedSequence(sequence);
    onOpen();
  };

  const handleModalClose = () => {
    setSelectedSequence(null);
    onClose();
  };

  const handleToggleStatus = async (sequence) => {
    try {
      if (sequence.active) {
        await deactivateInvoiceSequence(sequence.id);
      } else {
        await reactivateInvoiceSequence(sequence.id);
      }

      toast({
        title: sequence.active
          ? "Invoice sequence deactivated"
          : "Invoice sequence reactivated",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      await loadPageData({ silent: true });
    } catch (error) {
      toast({
        title: "Failed to update invoice sequence status",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Stack spacing={6}>
      <PageHeader
        title="Invoice Sequences"
        subtitle="Configure company-wise invoice numbering, prefixes, and financial year controls."
        actions={
          <>
            <Button
              leftIcon={<FileSpreadsheet size={16} />}
              variant="outline"
              onClick={handleDownloadTemplate}
            >
              Template
            </Button>

            <Button
              leftIcon={<Download size={16} />}
              variant="outline"
              onClick={handleExport}
            >
              Export
            </Button>

            <Button
              leftIcon={<Upload size={16} />}
              variant="outline"
              colorScheme="blue"
              onClick={onImportOpen}
            >
              Bulk Import
            </Button>

            <Button
              leftIcon={<RefreshCw size={16} />}
              variant="outline"
              onClick={() =>
                loadPageData({
                  silent: true,
                })
              }
              isLoading={refreshing}
            >
              Refresh
            </Button>

            <Button
              leftIcon={<Plus size={16} />}
              colorScheme="blue"
              onClick={handleCreate}
            >
              New Sequence
            </Button>
          </>
        }
      />
      <SimpleGrid
        columns={{
          base: 1,
          md: 3,
        }}
        spacing={4}
      >
        <MetricCard
          label="Total Sequences"
          value={sequences.length}
          helpText="Configured invoice sequences"
          loading={loading}
        />

        <MetricCard
          label="Active Sequences"
          value={sequences.filter((s) => s.active).length}
          helpText="Available for document generation"
          loading={loading}
        />

        <MetricCard
          label="Companies"
          value={companies.length}
          helpText="Companies with invoice numbering"
          loading={loading}
        />
      </SimpleGrid>
      <PageCard>
        <CardBody>
          <Box overflowX="auto">
            {loading ? (
              <Stack spacing={3}>
                <Skeleton height="56px" />
                <Skeleton height="56px" />
                <Skeleton height="56px" />
                <Skeleton height="56px" />
              </Stack>
            ) : sequences.length === 0 ? (
              <Box py={16} textAlign="center">
                <Hash size={40} style={{ margin: "0 auto" }} />
                <Text fontWeight="600" mt={3}>
                  No invoice sequences found
                </Text>
                <Text color="gray.500" mt={1}>
                  Create an invoice sequence before issuing invoices.
                </Text>
              </Box>
            ) : (
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>Company</Th>
                    <Th>Document Type</Th>
                    <Th>Financial Year</Th>
                    <Th>Prefix / Suffix</Th>
                    <Th isNumeric>Current Number</Th>
                    <Th isNumeric>Padding</Th>
                    <Th>Preview</Th>
                    <Th>Reset Policy</Th>
                    <Th>Status</Th>
                    <Th>Updated By</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sequences.map((sequence) => {
                    const company = companiesById.get(sequence.companyId);

                    return (
                      <Tr key={sequence.id}>
                        <Td>
                          <Stack spacing={0}>
                            <Text fontWeight="600">
                              {company?.name ||
                                `Company #${sequence.companyId}`}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              ID: {sequence.companyId}
                            </Text>
                          </Stack>
                        </Td>

                        <Td>{formatLabel(sequence.documentType)}</Td>
                        <Td>{sequence.financialYear}</Td>

                        <Td>
                          <Stack spacing={0}>
                            <Text fontWeight="600">
                              {sequence.prefix || "—"}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {sequence.suffix || "No suffix"}
                            </Text>
                          </Stack>
                        </Td>

                        <Td isNumeric>{sequence.currentNumber ?? 0}</Td>
                        <Td isNumeric>{sequence.paddingLength ?? 0}</Td>

                        <Td>
                          <Text fontWeight="700" color="blue.600">
                            {sequence.preview || buildPreview(sequence)}
                          </Text>
                        </Td>

                        <Td>{formatLabel(sequence.resetPolicy)}</Td>

                        <Td>
                          <Badge
                            colorScheme={sequence.active ? "green" : "gray"}
                          >
                            {sequence.active ? "ACTIVE" : "INACTIVE"}
                          </Badge>
                        </Td>

                        <Td>{sequence.updatedBy || "—"}</Td>

                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              size="sm"
                              variant="outline"
                              icon={<Edit size={16} />}
                              aria-label="Edit invoice sequence"
                              onClick={() => handleEdit(sequence)}
                            />
                            <IconButton
                              size="sm"
                              variant="outline"
                              colorScheme={sequence.active ? "red" : "green"}
                              icon={<Power size={16} />}
                              aria-label={
                                sequence.active
                                  ? "Deactivate invoice sequence"
                                  : "Reactivate invoice sequence"
                              }
                              onClick={() => handleToggleStatus(sequence)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            )}
          </Box>
        </CardBody>
      </PageCard>

      <InvoiceSequenceModal
        isOpen={isOpen}
        onClose={handleModalClose}
        onSuccess={() => loadPageData({ silent: true })}
        sequence={selectedSequence}
        companies={companies}
      />

      <BulkImportModal
        isOpen={isImportOpen}
        onClose={onImportClose}
        entityName="Invoice Sequence"
        previewColumns={invoiceSequencePreviewColumns}
        validationColumns={validationColumns}
        summaryCards={summaryCards}
        downloadTemplate={downloadInvoiceSequenceTemplate}
        downloadErrors={downloadInvoiceSequenceImportErrors}
        validateImport={validateInvoiceSequenceImport}
        commitImport={commitInvoiceSequenceImport}
        onSuccess={() =>
          loadPageData({
            silent: true,
          })
        }
      />
    </Stack>
  );
}
