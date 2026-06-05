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
import {
  deactivateCustomer,
  getCustomerStats,
  getMyCustomers,
  reactivateCustomer,
  downloadCustomerTemplate,
  exportCustomers,
  validateCustomerImport,
  commitCustomerImport,
} from "./customerApi";

import { downloadBlob } from "../../utils/fileDownload";

function MetricCard({ label, value, helpText, loading = false }) {
  return (
    <Card
      borderWidth="1px"
      borderColor="gray.200"
      shadow="sm"
      borderRadius="xl"
    >
      <CardBody>
        <Stat>
          <StatLabel color="gray.500">{label}</StatLabel>
          <StatNumber fontSize="2xl">
            {loading ? <Skeleton height="30px" width="100px" /> : value}
          </StatNumber>
          <StatHelpText mb="0">
            {loading ? <Skeleton height="16px" width="160px" /> : helpText}
          </StatHelpText>
        </Stat>
      </CardBody>
    </Card>
  );
}

export default function CustomerPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fileInputRef = React.useRef(null);

  const [importFile, setImportFile] = useState(null);

  const [validatingImport, setValidatingImport] = useState(false);

  const [committingImport, setCommittingImport] = useState(false);

  const [importResult, setImportResult] = useState(null);

  const [commitResult, setCommitResult] = useState(null);

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

  const handleValidateImport = async () => {
    setCommitResult(null);

    if (!importFile) {
      toast({
        title: "Choose an Excel file first",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });

      return;
    }

    setValidatingImport(true);

    try {
      const result = await validateCustomerImport(importFile);

      setImportResult(result);

      toast({
        title: result.valid ? "Validation Passed" : "Validation Failed",
        status: result.valid ? "success" : "warning",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Validation failed",
        description: error?.response?.data?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setValidatingImport(false);
    }
  };

  const handleCommitImport = async () => {
    if (!importFile) {
      return;
    }

    setCommittingImport(true);

    try {
      const result = await commitCustomerImport(importFile);

      toast({
        title:
          result.failed > 0
            ? "Import completed with errors"
            : "Import completed",
        description:
          `${result.inserted} inserted, ` +
          `${result.updated} updated, ` +
          `${result.failed} failed`,
        status: result.failed > 0 ? "warning" : "success",
        duration: 6000,
        isClosable: true,
      });

      setImportResult(null);
      setImportFile(null);
      setCommitResult(result);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadPageData({
        silent: true,
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: error?.response?.data?.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setCommittingImport(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;

    setImportFile(file);

    setImportResult(null);
    setCommitResult(null);
  };

  return (
    <Stack spacing={6}>
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Box>
          <Heading size="lg">Customers</Heading>
          <Text color="gray.500" mt={1}>
            Manage invoice-ready customer profiles with GST, address, and
            payment terms.
          </Text>
        </Box>

        <HStack spacing={3}>
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
            leftIcon={<RefreshCw size={16} />}
            variant="outline"
            onClick={() => loadPageData({ silent: true })}
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
        </HStack>
      </Flex>

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

      <Card>
        <CardBody>
          <Stack spacing={4}>
            <Heading size="sm">Customer Import</Heading>

            <Input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
            />

            <HStack>
              <Button
                leftIcon={<Upload size={16} />}
                onClick={handleValidateImport}
                isLoading={validatingImport}
              >
                Validate
              </Button>

              <Button
                colorScheme="green"
                onClick={handleCommitImport}
                isLoading={committingImport}
                isDisabled={!importResult?.valid}
              >
                Commit
              </Button>
            </HStack>
          </Stack>
        </CardBody>
      </Card>

      {importResult?.errors?.length > 0 && (
        <Card>
          <CardBody>
            <Stack spacing={2}>
              <Heading size="sm">Validation Errors</Heading>

              {importResult.errors.map((error, index) => (
                <Box key={index} p={2} borderWidth="1px" borderRadius="md">
                  <Text fontWeight="600">Row {error.rowNumber}</Text>

                  <Text>Column: {error.column}</Text>

                  {error.value && <Text>Value: {error.value}</Text>}

                  <Text color="red.500">{error.message}</Text>
                </Box>
              ))}
            </Stack>
          </CardBody>
        </Card>
      )}

      {importResult && (
        <Box p={3} borderWidth="1px" borderRadius="md">
          <Text>Total Rows: {importResult.totalRows}</Text>
          <Text>Valid Rows: {importResult.validRows}</Text>
          <Text>Invalid Rows: {importResult.invalidRows}</Text>
        </Box>
      )}

      {commitResult?.errors?.length > 0 && (
        <Card>
          <CardBody>
            <Stack spacing={2}>
              <Heading size="sm">Commit Errors</Heading>

              {commitResult.errors.map((error, index) => (
                <Box key={index} p={2} borderWidth="1px" borderRadius="md">
                  <Text fontWeight="600">Row {error.rowNumber}</Text>

                  <Text>{error.message}</Text>
                </Box>
              ))}
            </Stack>
          </CardBody>
        </Card>
      )}

      {commitResult && (
        <Card>
          <CardBody>
            <Stack spacing={2}>
              <Heading size="sm">Import Summary</Heading>

              <Text>
                Total Rows:
                {commitResult.totalRows}
              </Text>

              <Text color="green.600">
                Inserted:
                {commitResult.inserted}
              </Text>

              <Text color="blue.600">
                Updated:
                {commitResult.updated}
              </Text>

              <Text color="red.600">
                Failed:
                {commitResult.failed}
              </Text>
            </Stack>
          </CardBody>
        </Card>
      )}

      <Card
        borderWidth="1px"
        borderColor="gray.200"
        shadow="sm"
        borderRadius="xl"
      >
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
                <Box py={10} textAlign="center">
                  <Users size={28} style={{ margin: "0 auto" }} />
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
      </Card>

      <CustomerFormModal
        isOpen={isOpen}
        onClose={handleModalClose}
        onSuccess={() => loadPageData({ silent: true })}
        customer={selectedCustomer}
      />
    </Stack>
  );
}
