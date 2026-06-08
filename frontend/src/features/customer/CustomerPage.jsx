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
  Edit,
  Plus,
  Power,
  RefreshCw,
  Users,
  Download,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import CustomerFormModal from "./CustomerFormModal";
import BulkImportModal from "../../components/import/BulkImportModal";
import PageHeader from "../../layout/PageHeader";
import PageCard from "../../layout/PageCard";
import MetricCard from "../../layout/MetricCard";

import {
  deactivateCustomer,
  getCustomerStats,
  getMyCustomers,
  reactivateCustomer,
  downloadCustomerTemplate,
  downloadCustomerErrors,
  exportCustomers,
  validateCustomerImport,
  commitCustomerImport,
} from "./customerApi";

import { downloadBlob } from "../../utils/fileDownload";

const customerPreviewColumns = [
  {
    label: "Code",
    dtoField: "code",
    rawField: "CODE",
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
    dtoField: "customerType",
    rawField: "CUSTOMER_TYPE",
    formatter: (value) => value?.toString().replaceAll("_", " "),
  },
];

const customerValidationColumns = [
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
    color: undefined,
  },
  {
    label: "Valid Rows",
    field: "validRows",
    color: "green.500",
  },
  {
    label: "Invalid Rows",
    field: "invalidRows",
    color: "red.500",
  },
];

export default function CustomerPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isImportOpen,
    onOpen: onImportOpen,
    onClose: onImportClose,
  } = useDisclosure();

  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recentCustomers: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("");
  const [gstTypeFilter, setGstTypeFilter] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const loadPageData = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [customersData, statsData] = await Promise.all([
        getMyCustomers(),
        getCustomerStats(),
      ]);

      setCustomers(customersData || []);
      setStats(
        statsData || {
          total: 0,
          active: 0,
          inactive: 0,
          recentCustomers: [],
        },
      );
    } catch (error) {
      toast({
        title: "Failed to load customers",
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

  const customerTypeOptions = useMemo(() => {
    return [
      ...new Set(customers.map((item) => item.customerType).filter(Boolean)),
    ].sort();
  }, [customers]);

  const gstTypeOptions = useMemo(() => {
    return [
      ...new Set(
        customers.map((item) => item.gstRegistrationType).filter(Boolean),
      ),
    ].sort();
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesQuery =
        !q ||
        String(customer.code || "")
          .toLowerCase()
          .includes(q) ||
        String(customer.legalName || "")
          .toLowerCase()
          .includes(q) ||
        String(customer.tradeName || "")
          .toLowerCase()
          .includes(q) ||
        String(customer.gstin || "")
          .toLowerCase()
          .includes(q) ||
        String(customer.pan || "")
          .toLowerCase()
          .includes(q) ||
        String(customer.contactPerson || "")
          .toLowerCase()
          .includes(q) ||
        String(customer.email || "")
          .toLowerCase()
          .includes(q) ||
        String(customer.phone || "")
          .toLowerCase()
          .includes(q);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "ACTIVE" && customer.active) ||
        (statusFilter === "INACTIVE" && !customer.active);

      const matchesCustomerType =
        !customerTypeFilter ||
        String(customer.customerType || "") === customerTypeFilter;

      const matchesGstType =
        !gstTypeFilter ||
        String(customer.gstRegistrationType || "") === gstTypeFilter;

      return (
        matchesQuery && matchesStatus && matchesCustomerType && matchesGstType
      );
    });
  }, [customers, query, statusFilter, customerTypeFilter, gstTypeFilter]);

  const handleCreate = () => {
    setSelectedCustomer(null);
    onOpen();
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    onOpen();
  };

  const handleModalClose = () => {
    setSelectedCustomer(null);
    onClose();
  };

  const handleToggleStatus = async (customer) => {
    try {
      if (customer.active) {
        await deactivateCustomer(customer.id);
      } else {
        await reactivateCustomer(customer.id);
      }

      toast({
        title: customer.active
          ? "Customer deactivated"
          : "Customer reactivated",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      await loadPageData({ silent: true });
    } catch (error) {
      toast({
        title: "Failed to update customer status",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadCustomerTemplate();

      downloadBlob(blob, "customer-template.xlsx");
    } catch (error) {
      toast({
        title: "Failed to download template",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportCustomers();

      downloadBlob(blob, "customers.xlsx");
    } catch (error) {
      toast({
        title: "Failed to export customers",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Stack spacing={6}>
      <PageHeader
        title="Customers"
        subtitle="Manage customer master data and GST registrations"
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
              New Customer
            </Button>
          </>
        }
      />
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <MetricCard
          label="Total Customers"
          value={stats.total}
          helpText="All customers in your tenant"
          loading={loading}
        />
        <MetricCard
          label="Active Customers"
          value={stats.active}
          helpText="Available for new invoices"
          loading={loading}
        />
        <MetricCard
          label="Inactive Customers"
          value={stats.inactive}
          helpText="Hidden from active usage"
          loading={loading}
        />
      </SimpleGrid>

      <PageCard>
        <CardBody>
          <Stack spacing={4}>
            <SimpleGrid columns={{ base: 1, lg: 4 }} spacing={3}>
              <Input
                placeholder="Search by code, legal name, GSTIN, PAN, contact"
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
                placeholder="Filter by customer type"
                value={customerTypeFilter}
                onChange={(e) => setCustomerTypeFilter(e.target.value)}
              >
                {customerTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </option>
                ))}
              </Select>

              <Select
                placeholder="Filter by GST registration"
                value={gstTypeFilter}
                onChange={(e) => setGstTypeFilter(e.target.value)}
              >
                {gstTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll("_", " ")}
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
              ) : filteredCustomers.length === 0 ? (
                <Box py={16} textAlign="center">
                  <Users size={40} style={{ margin: "0 auto" }} />
                  <Text fontWeight="600" mt={3}>
                    No customers found
                  </Text>
                  <Text color="gray.500" mt={1}>
                    Create a customer or adjust your filters.
                  </Text>
                </Box>
              ) : (
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th>Code</Th>
                      <Th>Legal / Trade Name</Th>
                      <Th>GSTIN / PAN</Th>
                      <Th>Contact</Th>
                      <Th>Type</Th>
                      <Th>Billing State</Th>
                      <Th isNumeric>Payment Terms</Th>
                      <Th>Status</Th>
                      <Th>Updated By</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredCustomers.map((customer) => (
                      <Tr key={customer.id}>
                        <Td>
                          <Text fontWeight="700">{customer.code}</Text>
                        </Td>

                        <Td>
                          <Stack spacing={0}>
                            <Text fontWeight="600">{customer.legalName}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {customer.tradeName || "—"}
                            </Text>
                          </Stack>
                        </Td>

                        <Td>
                          <Stack spacing={0}>
                            <Text fontWeight="600">
                              {customer.gstin || "—"}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {customer.pan || "—"}
                            </Text>
                          </Stack>
                        </Td>

                        <Td>
                          <Stack spacing={0}>
                            <Text>{customer.contactPerson || "—"}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {customer.email || customer.phone || "—"}
                            </Text>
                          </Stack>
                        </Td>

                        <Td>
                          <Stack spacing={0}>
                            <Text>
                              {customer.customerType?.replaceAll("_", " ") ||
                                "—"}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {customer.gstRegistrationType?.replaceAll(
                                "_",
                                " ",
                              ) || "—"}
                            </Text>
                          </Stack>
                        </Td>

                        <Td>
                          <Stack spacing={0}>
                            <Text>{customer.billingState || "—"}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {customer.billingStateCode || "—"}
                            </Text>
                          </Stack>
                        </Td>

                        <Td isNumeric>{customer.paymentTermsDays ?? 0} days</Td>

                        <Td>
                          <Badge
                            colorScheme={customer.active ? "green" : "gray"}
                          >
                            {customer.active ? "ACTIVE" : "INACTIVE"}
                          </Badge>
                        </Td>

                        <Td>{customer.updatedBy || "—"}</Td>

                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              size="sm"
                              variant="outline"
                              icon={<Edit size={16} />}
                              aria-label="Edit customer"
                              onClick={() => handleEdit(customer)}
                            />
                            <IconButton
                              size="sm"
                              variant="outline"
                              colorScheme={customer.active ? "red" : "green"}
                              icon={<Power size={16} />}
                              aria-label={
                                customer.active
                                  ? "Deactivate customer"
                                  : "Reactivate customer"
                              }
                              onClick={() => handleToggleStatus(customer)}
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

      <BulkImportModal
        isOpen={isImportOpen}
        onClose={onImportClose}
        entityName="Customer"
        previewColumns={customerPreviewColumns}
        validationColumns={customerValidationColumns}
        summaryCards={summaryCards}
        downloadTemplate={downloadCustomerTemplate}
        downloadErrors={downloadCustomerErrors}
        validateImport={validateCustomerImport}
        commitImport={commitCustomerImport}
        onSuccess={() =>
          loadPageData({
            silent: true,
          })
        }
      />
      <CustomerFormModal
        isOpen={isOpen}
        onClose={handleModalClose}
        onSuccess={() => loadPageData({ silent: true })}
        customer={selectedCustomer}
      />
    </Stack>
  );
}
