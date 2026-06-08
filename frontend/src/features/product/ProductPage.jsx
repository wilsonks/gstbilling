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
  Package,
  Download,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import ProductFormModal from "./ProductFormModal";
import BulkImportModal from "../../components/import/BulkImportModal";
import PageHeader from "../../layout/PageHeader";
import PageCard from "../../layout/PageCard";
import MetricCard from "../../layout/MetricCard";
import {
  deactivateProduct,
  getProducts,
  getProductStats,
  reactivateProduct,
  downloadProductTemplate,
  downloadProductImportErrors,
  validateProductImport,
  commitProductImport,
  exportProducts,
} from "./productApi";

import { downloadBlob } from "../../utils/fileDownload";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export default function ProductPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isImportOpen,
    onOpen: onImportOpen,
    onClose: onImportClose,
  } = useDisclosure();

  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recentProducts: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [gstFilter, setGstFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadPageData = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [productsData, statsData] = await Promise.all([
        getProducts(),
        getProductStats(),
      ]);

      setProducts(productsData || []);
      setStats(
        statsData || {
          total: 0,
          active: 0,
          inactive: 0,
          recentProducts: [],
        },
      );
    } catch (error) {
      toast({
        title: "Failed to load products",
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

  const gstOptions = useMemo(() => {
    return [
      ...new Set(
        products
          .map((item) => item.gstRate)
          .filter((v) => v !== null && v !== undefined),
      ),
    ].sort((a, b) => Number(a) - Number(b));
  }, [products]);

  const unitOptions = useMemo(() => {
    return [
      ...new Set(products.map((item) => item.unitCode).filter(Boolean)),
    ].sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !q ||
        String(product.code || "")
          .toLowerCase()
          .includes(q) ||
        String(product.name || "")
          .toLowerCase()
          .includes(q) ||
        String(product.description || "")
          .toLowerCase()
          .includes(q) ||
        String(product.hsnSacCode || "")
          .toLowerCase()
          .includes(q) ||
        String(product.hsnSacDescription || "")
          .toLowerCase()
          .includes(q) ||
        String(product.unitCode || "")
          .toLowerCase()
          .includes(q) ||
        String(product.gstSlabCode || "")
          .toLowerCase()
          .includes(q);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "ACTIVE" && product.active) ||
        (statusFilter === "INACTIVE" && !product.active);

      const matchesGst =
        !gstFilter || String(product.gstRate ?? "") === String(gstFilter);

      const matchesUnit =
        !unitFilter || String(product.unitCode || "") === String(unitFilter);

      return matchesQuery && matchesStatus && matchesGst && matchesUnit;
    });
  }, [products, query, statusFilter, gstFilter, unitFilter]);

  const handleCreate = () => {
    setSelectedProduct(null);
    onOpen();
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    onOpen();
  };

  const handleModalClose = () => {
    setSelectedProduct(null);
    onClose();
  };

  const handleToggleStatus = async (product) => {
    try {
      if (product.active) {
        await deactivateProduct(product.id);
      } else {
        await reactivateProduct(product.id);
      }

      toast({
        title: product.active ? "Product deactivated" : "Product reactivated",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      await loadPageData({ silent: true });
    } catch (error) {
      toast({
        title: "Failed to update product status",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadProductTemplate();

      downloadBlob(blob, "product-template.xlsx");
    } catch (error) {
      toast({
        title: "Failed to download template",
        status: "error",
      });
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportProducts();

      downloadBlob(blob, "products.xlsx");
    } catch (error) {
      toast({
        title: "Failed to export products",
        status: "error",
      });
    }
  };

  const productPreviewColumns = [
    {
      label: "Code",
      dtoField: "code",
      rawField: "CODE",
    },

    {
      label: "Name",
      dtoField: "name",
      rawField: "NAME",
    },

    {
      label: "HSN",
      dtoField: "hsnSacCode",
      rawField: "HSN_SAC_CODE",
    },

    {
      label: "Unit",
      dtoField: "unitCode",
      rawField: "UNIT_CODE",
    },

    {
      label: "GST Slab",
      dtoField: "gstSlabCode",
      rawField: "GST_SLAB_CODE",
    },

    {
      label: "Price",
      dtoField: "defaultPrice",
      rawField: "DEFAULT_PRICE",
      formatter: (value) => (value == null ? "-" : Number(value).toFixed(2)),
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

  return (
    <Stack spacing={6}>
      <PageHeader
        title="Products"
        subtitle="Manage tenant product catalog with standardized HSN/SAC, unit and GST slab references."
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
              New Product
            </Button>
          </>
        }
      />
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <MetricCard
          label="Total Products"
          value={stats.total}
          helpText="All products in your tenant catalog"
          loading={loading}
        />
        <MetricCard
          label="Active Products"
          value={stats.active}
          helpText="Available for new transactions"
          loading={loading}
        />
        <MetricCard
          label="Inactive Products"
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
                placeholder="Search by code, name, description, HSN/SAC, unit, GST slab"
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
                placeholder="Filter by GST rate"
                value={gstFilter}
                onChange={(e) => setGstFilter(e.target.value)}
              >
                {gstOptions.map((rate) => (
                  <option key={String(rate)} value={String(rate)}>
                    {Number(rate || 0).toFixed(2)}%
                  </option>
                ))}
              </Select>

              <Select
                placeholder="Filter by unit"
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
              >
                {unitOptions.map((unitCode) => (
                  <option key={unitCode} value={unitCode}>
                    {unitCode}
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
              ) : filteredProducts.length === 0 ? (
                <Box py={16} textAlign="center">
                  <Box display="flex" justifyContent="center">
                    <Package size={40} />
                  </Box>
                  <Text fontWeight="600" mt={3}>
                    No products found
                  </Text>
                  <Text color="gray.500" mt={1}>
                    Create a product or adjust your filters.
                  </Text>
                </Box>
              ) : (
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th>Code</Th>
                      <Th>Name</Th>
                      <Th>Description</Th>
                      <Th>HSN/SAC</Th>
                      <Th>Unit</Th>
                      <Th>GST Slab</Th>
                      <Th isNumeric>GST %</Th>
                      <Th isNumeric>Default Price</Th>
                      <Th>Status</Th>
                      <Th>Updated By</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredProducts.map((product) => (
                      <Tr key={product.id}>
                        <Td>
                          <Text fontWeight="700">{product.code}</Text>
                        </Td>

                        <Td>
                          <Text fontWeight="600">{product.name}</Text>
                        </Td>

                        <Td maxW="280px">
                          <Text noOfLines={2} color="gray.600">
                            {product.description || "—"}
                          </Text>
                        </Td>

                        <Td>
                          <Stack spacing={0}>
                            <Text fontWeight="600">
                              {product.hsnSacCode || "—"}
                            </Text>
                            <Text fontSize="xs" color="gray.500" noOfLines={2}>
                              {product.hsnSacDescription || ""}
                            </Text>
                          </Stack>
                        </Td>

                        <Td>
                          <Stack spacing={0}>
                            <Text fontWeight="600">
                              {product.unitCode || "—"}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {product.unitName || ""}
                            </Text>
                          </Stack>
                        </Td>

                        <Td>
                          <Stack spacing={0}>
                            <Text fontWeight="600">
                              {product.gstSlabCode || "—"}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {product.gstSlabName || ""}
                            </Text>
                          </Stack>
                        </Td>

                        <Td isNumeric>
                          {Number(product.gstRate || 0).toFixed(2)}%
                        </Td>

                        <Td isNumeric>
                          {formatCurrency(product.defaultPrice)}
                        </Td>

                        <Td>
                          <Badge
                            colorScheme={product.active ? "green" : "gray"}
                          >
                            {product.active ? "ACTIVE" : "INACTIVE"}
                          </Badge>
                        </Td>
                        <Td>{product.updatedBy || "—"}</Td>

                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              size="sm"
                              variant="outline"
                              icon={<Edit size={16} />}
                              aria-label="Edit product"
                              onClick={() => handleEdit(product)}
                            />
                            <IconButton
                              size="sm"
                              variant="outline"
                              colorScheme={product.active ? "red" : "green"}
                              icon={<Power size={16} />}
                              aria-label={
                                product.active
                                  ? "Deactivate product"
                                  : "Reactivate product"
                              }
                              onClick={() => handleToggleStatus(product)}
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

      <ProductFormModal
        isOpen={isOpen}
        onClose={handleModalClose}
        onSuccess={() => loadPageData({ silent: true })}
        product={selectedProduct}
      />

      <BulkImportModal
        isOpen={isImportOpen}
        onClose={onImportClose}
        entityName="Product"
        previewColumns={productPreviewColumns}
        validationColumns={validationColumns}
        summaryCards={summaryCards}
        downloadTemplate={downloadProductTemplate}
        downloadErrors={downloadProductImportErrors}
        validateImport={validateProductImport}
        commitImport={commitProductImport}
        onSuccess={() =>
          loadPageData({
            silent: true,
          })
        }
      />
    </Stack>
  );
}
