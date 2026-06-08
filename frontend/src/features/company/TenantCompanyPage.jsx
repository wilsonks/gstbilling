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
  Input,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
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
  Building2,
  Edit,
  Plus,
  Power,
  RefreshCw,
  Download,
  Upload,
  FileSpreadsheet,
} from "lucide-react";

import BulkImportModal from "../../components/import/BulkImportModal";
import TenantCompanyFormModal from "./TenantCompanyFormModal";
import PageHeader from "../../layout/PageHeader";
import PageCard from "../../layout/PageCard";
import MetricCard from "../../layout/MetricCard";

import {
  deactivateCompany,
  getCompanyStats,
  getMyCompanies,
  reactivateCompany,
  downloadCompanyTemplate,
  exportCompaniesExcel,
  validateCompanyImport,
  commitCompanyImport,
  downloadCompanyImportErrors,
} from "./companyApi";

import { downloadBlob } from "../../utils/fileDownload";

function formatCompanyType(value) {
  return value?.replaceAll("_", " ") || "—";
}

const companyPreviewColumns = [
  {
    label: "Name",
    dtoField: "name",
    rawField: "NAME",
  },

  {
    label: "Legal Name",
    dtoField: "legalName",
    rawField: "LEGAL_NAME",
  },

  {
    label: "Trade Name",
    dtoField: "tradeName",
    rawField: "TRADE_NAME",
  },

  {
    label: "GSTIN",
    dtoField: "gstin",
    rawField: "GSTIN",
  },

  {
    label: "Type",
    dtoField: "type",
    rawField: "TYPE",
    formatter: (value) => value?.toString().replaceAll("_", " "),
  },

  {
    label: "City",
    dtoField: "city",
    rawField: "CITY",
  },

  {
    label: "State",
    dtoField: "state",
    rawField: "STATE",
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

export default function TenantCompanyPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isImportOpen,
    onOpen: onImportOpen,
    onClose: onImportClose,
  } = useDisclosure();

  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recentCompanies: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [selectedCompany, setSelectedCompany] = useState(null);

  const loadPageData = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [companiesData, statsData] = await Promise.all([
        getMyCompanies(),
        getCompanyStats(),
      ]);

      setCompanies(companiesData || []);
      setStats(
        statsData || {
          total: 0,
          active: 0,
          inactive: 0,
          recentCompanies: [],
        },
      );
    } catch (error) {
      toast({
        title: "Failed to load companies",
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

  const typeOptions = useMemo(() => {
    return [
      ...new Set(companies.map((item) => item.type).filter(Boolean)),
    ].sort();
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const q = query.trim().toLowerCase();

    return companies.filter((company) => {
      const matchesQuery =
        !q ||
        String(company.name || "")
          .toLowerCase()
          .includes(q) ||
        String(company.legalName || "")
          .toLowerCase()
          .includes(q) ||
        String(company.tradeName || "")
          .toLowerCase()
          .includes(q) ||
        String(company.gstin || "")
          .toLowerCase()
          .includes(q) ||
        String(company.email || "")
          .toLowerCase()
          .includes(q) ||
        String(company.phone || "")
          .toLowerCase()
          .includes(q) ||
        String(company.city || "")
          .toLowerCase()
          .includes(q) ||
        String(company.state || "")
          .toLowerCase()
          .includes(q);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "ACTIVE" && company.active) ||
        (statusFilter === "INACTIVE" && !company.active);

      const matchesType =
        !typeFilter || String(company.type || "") === typeFilter;

      return matchesQuery && matchesStatus && matchesType;
    });
  }, [companies, query, statusFilter, typeFilter]);

  const handleDownloadTemplate = async () => {
    const blob = await downloadCompanyTemplate();

    downloadBlob(blob, "company-template.xlsx");
  };

  const handleExport = async () => {
    const blob = await exportCompaniesExcel();

    downloadBlob(blob, "companies.xlsx");
  };

  const handleCreate = () => {
    setSelectedCompany(null);
    onOpen();
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    onOpen();
  };

  const handleModalClose = () => {
    setSelectedCompany(null);
    onClose();
  };

  const handleToggleStatus = async (company) => {
    try {
      if (company.active) {
        await deactivateCompany(company.id);
      } else {
        await reactivateCompany(company.id);
      }

      toast({
        title: company.active ? "Company deactivated" : "Company reactivated",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      await loadPageData({ silent: true });
    } catch (error) {
      toast({
        title: "Failed to update company status",
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
        title="Companies"
        subtitle="Manage invoice-ready company profiles for the active tenant."
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
              New Company
            </Button>
          </>
        }
      />

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <MetricCard
          label="Total Companies"
          value={stats.total}
          helpText="All companies in this tenant"
          loading={loading}
        />
        <MetricCard
          label="Active Companies"
          value={stats.active}
          helpText="Available for company context"
          loading={loading}
        />
        <MetricCard
          label="Inactive Companies"
          value={stats.inactive}
          helpText="Hidden from active use"
          loading={loading}
        />
      </SimpleGrid>

      <PageCard>
        <CardBody>
          <Stack spacing={4}>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={3}>
              <Input
                placeholder="Search by name, GSTIN, city, email, phone"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>

              <Select
                placeholder="Filter by company type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {formatCompanyType(type)}
                  </option>
                ))}
              </Select>
            </SimpleGrid>

            <Box overflowX="auto">
              {loading ? (
                <Stack spacing={3}>
                  <Skeleton height="56px" />
                  <Skeleton height="56px" />
                  <Skeleton height="56px" />
                  <Skeleton height="56px" />
                </Stack>
              ) : filteredCompanies.length === 0 ? (
                <Box py={16} textAlign="center">
                  <Building2 size={40} style={{ margin: "0 auto" }} />
                  <Text fontWeight="600" mt={3}>
                    No companies found
                  </Text>
                  <Text color="gray.500" mt={1}>
                    Create a company or adjust your filters.
                  </Text>
                </Box>
              ) : (
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Legal / Trade Name</Th>
                      <Th>GSTIN</Th>
                      <Th>Location</Th>
                      <Th>Contact</Th>
                      <Th>Type</Th>
                      <Th>Status</Th>
                      <Th>Updated By</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredCompanies.map((company) => (
                      <Tr key={company.id}>
                        <Td>
                          <Text fontWeight="700">{company.name}</Text>
                        </Td>

                        <Td>
                          <Stack spacing={0}>
                            <Text fontWeight="600">
                              {company.legalName || "—"}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {company.tradeName || "—"}
                            </Text>
                          </Stack>
                        </Td>

                        <Td>
                          <Stack spacing={0}>
                            <Text fontWeight="600">{company.gstin}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {company.stateCode || "—"}
                            </Text>
                          </Stack>
                        </Td>

                        <Td>
                          <Stack spacing={0}>
                            <Text>
                              {[company.city, company.state]
                                .filter(Boolean)
                                .join(", ") || "—"}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {company.pincode || "—"}
                            </Text>
                          </Stack>
                        </Td>

                        <Td>
                          <Stack spacing={0}>
                            <Text>{company.email || "—"}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {company.phone || "—"}
                            </Text>
                          </Stack>
                        </Td>

                        <Td>{formatCompanyType(company.type)}</Td>

                        <Td>
                          <Badge
                            colorScheme={company.active ? "green" : "gray"}
                          >
                            {company.active ? "ACTIVE" : "INACTIVE"}
                          </Badge>
                        </Td>

                        <Td>{company.updatedBy || "—"}</Td>

                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              size="sm"
                              variant="outline"
                              icon={<Edit size={16} />}
                              aria-label="Edit company"
                              onClick={() => handleEdit(company)}
                            />
                            <IconButton
                              size="sm"
                              variant="outline"
                              colorScheme={company.active ? "red" : "green"}
                              icon={<Power size={16} />}
                              aria-label={
                                company.active
                                  ? "Deactivate company"
                                  : "Reactivate company"
                              }
                              onClick={() => handleToggleStatus(company)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>
          </Stack>
        </CardBody>
      </PageCard>

      <TenantCompanyFormModal
        isOpen={isOpen}
        onClose={handleModalClose}
        onSuccess={() => loadPageData({ silent: true })}
        company={selectedCompany}
      />

      <BulkImportModal
        isOpen={isImportOpen}
        onClose={onImportClose}
        entityName="Company"
        previewColumns={companyPreviewColumns}
        validationColumns={validationColumns}
        summaryCards={summaryCards}
        downloadTemplate={downloadCompanyTemplate}
        downloadErrors={downloadCompanyImportErrors}
        validateImport={validateCompanyImport}
        commitImport={commitCompanyImport}
        onSuccess={() =>
          loadPageData({
            silent: true,
          })
        }
      />
    </Stack>
  );
}
