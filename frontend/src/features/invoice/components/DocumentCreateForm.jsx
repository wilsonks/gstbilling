import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { createInvoice, getInvoiceById } from "../invoiceApi";
import { getMyCustomers } from "../../customer/customerApi";
import { getMyProducts } from "../../product/productApi";
import CustomerSelect from "../../../components/async/CustomerSelect";
import ProductSelect from "../../../components/async/ProductSelect";
import ReferenceInvoiceSelect from "../ReferenceInvoiceSelect";
import {
  resolveDocumentDetailPath,
  resolveDocumentListPath,
} from "../documentRoutes";

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

const initialLine = {
  productId: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
};

export default function DocumentCreateForm({
  documentType,
  title,
  description,
  successTitle,
  embedded = false,
  onCancel,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const requiresReference =
    documentType === "CREDIT_NOTE" || documentType === "DEBIT_NOTE";
  const isProforma = documentType === "PROFORMA_INVOICE";
  const isTaxInvoice = documentType === "TAX_INVOICE";

  const prefilledReferenceInvoiceId = location.state?.referenceInvoiceId
    ? String(location.state.referenceInvoiceId)
    : "";

  const prefilledSourceProformaId = location.state?.sourceProformaId
    ? String(location.state.sourceProformaId)
    : "";

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [referenceInvoice, setReferenceInvoice] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingReferenceInvoice, setLoadingReferenceInvoice] = useState(false);

  const [form, setForm] = useState({
    customerId: "",
    referenceInvoiceId: prefilledReferenceInvoiceId,
    sourceProformaId: prefilledSourceProformaId,
    invoiceDate: new Date().toISOString().slice(0, 10),
    validUntil: "",
    notes: "",
    termsAndConditions: "Payment due within agreed credit period.",
    lines: [{ ...initialLine }],
  });

  const handleBack = () => {
    if (embedded && onCancel) {
      onCancel();
      return;
    }

    navigate(resolveDocumentListPath(documentType));
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [customerData, productData] = await Promise.all([
          getMyCustomers(),
          getMyProducts(),
        ]);

        setCustomers(customerData || []);
        setProducts(productData || []);

        if (!requiresReference && !prefilledSourceProformaId && (customerData || []).length > 0) {
          setForm((prev) => ({
            ...prev,
            customerId: prev.customerId || String(customerData[0].id),
          }));
        }
      } catch (error) {
        toast({
          title: "Failed to load form data",
          description: error?.response?.data?.message || "Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast, requiresReference, prefilledSourceProformaId]);

  useEffect(() => {
    if (!requiresReference || !form.referenceInvoiceId) {
      setReferenceInvoice(null);
      return;
    }

    let ignore = false;

    const loadReferenceInvoice = async () => {
      setLoadingReferenceInvoice(true);
      try {
        const invoice = await getInvoiceById(form.referenceInvoiceId);
        if (ignore) return;

        setReferenceInvoice(invoice);

        setForm((prev) => ({
          ...prev,
          customerId: invoice?.customerId ? String(invoice.customerId) : "",
          lines:
            (invoice?.lines || []).map((line) => ({
              productId: line.productId ? String(line.productId) : "",
              description: line.description || "",
              quantity: Number(line.quantity || 0),
              unitPrice: Number(line.unitPrice || 0),
            })) || [{ ...initialLine }],
          notes:
            prev.notes?.trim()
              ? prev.notes
              : `${
                  documentType === "CREDIT_NOTE" ? "Credit" : "Debit"
                } note against invoice ${invoice?.invoiceNo || ""}`.trim(),
        }));
      } catch (error) {
        if (!ignore) {
          setReferenceInvoice(null);
          toast({
            title: "Failed to load reference invoice",
            description: error?.response?.data?.message || "Please try again.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } finally {
        if (!ignore) {
          setLoadingReferenceInvoice(false);
        }
      }
    };

    loadReferenceInvoice();

    return () => {
      ignore = true;
    };
  }, [requiresReference, form.referenceInvoiceId, documentType, toast]);

  useEffect(() => {
    if (!isTaxInvoice || !form.sourceProformaId) {
      return;
    }

    let ignore = false;

    const loadSourceProforma = async () => {
      setLoadingReferenceInvoice(true);
      try {
        const proforma = await getInvoiceById(form.sourceProformaId);
        if (ignore) return;

        setForm((prev) => ({
          ...prev,
          customerId: proforma?.customerId ? String(proforma.customerId) : "",
          lines:
            (proforma?.lines || []).map((line) => ({
              productId: line.productId ? String(line.productId) : "",
              description: line.description || "",
              quantity: Number(line.quantity || 0),
              unitPrice: Number(line.unitPrice || 0),
            })) || [{ ...initialLine }],
          notes: prev.notes?.trim() ? prev.notes : proforma?.notes || "",
          termsAndConditions:
            prev.termsAndConditions?.trim()
              ? prev.termsAndConditions
              : proforma?.termsAndConditions || "",
        }));
      } catch (error) {
        if (!ignore) {
          toast({
            title: "Failed to load source proforma",
            description: error?.response?.data?.message || "Please try again.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } finally {
        if (!ignore) {
          setLoadingReferenceInvoice(false);
        }
      }
    };

    loadSourceProforma();

    return () => {
      ignore = true;
    };
  }, [isTaxInvoice, form.sourceProformaId, toast]);

  const productsById = useMemo(() => {
    return new Map(products.map((product) => [String(product.id), product]));
  }, [products]);

  const selectedCustomer = useMemo(() => {
    return (
      customers.find((customer) => String(customer.id) === String(form.customerId)) || null
    );
  }, [customers, form.customerId]);

  const computedLines = useMemo(() => {
    return form.lines.map((line) => {
      const product = productsById.get(String(line.productId));
      const quantity = toNumber(line.quantity, 0);
      const unitPrice = toNumber(line.unitPrice, 0);
      const taxable = quantity * unitPrice;
      const gstRate = Number(product?.gstRate ?? 0);
      const taxAmount = (taxable * gstRate) / 100;
      const lineTotal = taxable + taxAmount;

      return {
        ...line,
        product,
        quantity,
        unitPrice,
        gstRate,
        taxable,
        taxAmount,
        lineTotal,
      };
    });
  }, [form.lines, productsById]);

  const summary = useMemo(() => {
    const taxableTotal = computedLines.reduce((sum, line) => sum + line.taxable, 0);
    const taxTotal = computedLines.reduce((sum, line) => sum + line.taxAmount, 0);

    return {
      taxableTotal,
      taxTotal,
      grandTotal: taxableTotal + taxTotal,
    };
  }, [computedLines]);

  const handleHeaderChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReferenceChange = (value) => {
    setForm((prev) => ({
      ...prev,
      referenceInvoiceId: value,
      customerId: "",
      lines: [{ ...initialLine }],
      notes: "",
    }));
  };

  const handleLineChange = (index, field, value) => {
    setForm((prev) => {
      const nextLines = [...prev.lines];
      const nextLine = { ...nextLines[index], [field]: value };

      if (field === "productId") {
        const product = productsById.get(String(value));
        nextLine.unitPrice =
          product?.defaultPrice ??
          product?.price ??
          product?.sellingPrice ??
          0;
        nextLine.description =
          product?.description ??
          product?.name ??
          "";
      }

      nextLines[index] = nextLine;

      return {
        ...prev,
        lines: nextLines,
      };
    });
  };

  const addLine = () => {
    setForm((prev) => ({
      ...prev,
      lines: [...prev.lines, { ...initialLine }],
    }));
  };

  const removeLine = (index) => {
    setForm((prev) => ({
      ...prev,
      lines:
        prev.lines.length === 1
          ? prev.lines
          : prev.lines.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    if (requiresReference && !form.referenceInvoiceId) {
      toast({
        title: "Reference invoice is required",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return false;
    }

    if (!form.customerId) {
      toast({
        title: "Customer is required",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return false;
    }

    if (!form.invoiceDate) {
      toast({
        title: "Date is required",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return false;
    }

    if (isProforma && form.validUntil && form.validUntil < form.invoiceDate) {
      toast({
        title: "Valid until cannot be earlier than invoice date",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return false;
    }

    if (!form.lines.length) {
      toast({
        title: "At least one line item is required",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return false;
    }

    for (let i = 0; i < form.lines.length; i += 1) {
      const line = form.lines[i];

      if (!line.productId) {
        toast({
          title: `Product is required on line ${i + 1}`,
          status: "warning",
          duration: 2500,
          isClosable: true,
        });
        return false;
      }

      if (toNumber(line.quantity, 0) <= 0) {
        toast({
          title: `Quantity must be greater than 0 on line ${i + 1}`,
          status: "warning",
          duration: 2500,
          isClosable: true,
        });
        return false;
      }

      if (toNumber(line.unitPrice, -1) < 0) {
        toast({
          title: `Unit price cannot be negative on line ${i + 1}`,
          status: "warning",
          duration: 2500,
          isClosable: true,
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        customerId: Number(form.customerId),
        documentType,
        referenceInvoiceId: requiresReference
          ? Number(form.referenceInvoiceId)
          : null,
        sourceProformaId:
          isTaxInvoice && form.sourceProformaId
            ? Number(form.sourceProformaId)
            : null,
        invoiceDate: form.invoiceDate,
        validUntil: isProforma ? form.validUntil || null : null,
        notes: form.notes?.trim() || null,
        termsAndConditions: form.termsAndConditions?.trim() || null,
        lines: form.lines.map((line) => ({
          productId: Number(line.productId),
          description: line.description?.trim() || null,
          quantity: Number(line.quantity),
          unitPrice: Number(line.unitPrice),
        })),
      };

      const created = await createInvoice(payload);

      toast({
        title: successTitle,
        description: `${created.invoiceNo} created successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate(resolveDocumentDetailPath(created), {
        state: {
          backgroundLocation: location.state?.backgroundLocation || location,
          returnTo:
            location.state?.returnTo || resolveDocumentListPath(documentType),
        },
      });
    } catch (error) {
      toast({
        title: "Failed to create document",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={6}>
      {!embedded && (
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <HStack spacing={3} mb={2}>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<ArrowLeft size={14} />}
                onClick={handleBack}
              >
                Back
              </Button>
            </HStack>

            <Heading size="lg">{title}</Heading>
            <Text color="gray.500" mt={1}>
              {description}
            </Text>
          </Box>

          <Button colorScheme="blue" onClick={handleSubmit} isLoading={saving}>
            Create
          </Button>
        </Flex>
      )}

      {embedded && (
        <Flex justify="flex-end">
          <HStack spacing={3}>
            <Button variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit} isLoading={saving}>
              Create
            </Button>
          </HStack>
        </Flex>
      )}

      <Card borderWidth="1px" borderColor="gray.200" shadow="sm" borderRadius="xl">
        <CardBody>
          <Stack spacing={5}>
            {!embedded && <Heading size="md">Header</Heading>}
            {embedded && (
              <Box>
                <Heading size="md">{title}</Heading>
                <Text color="gray.500" mt={1}>
                  {description}
                </Text>
              </Box>
            )}

            {isProforma && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                Proforma invoices can include a validity date and can later be converted to a tax invoice.
              </Alert>
            )}

            {isTaxInvoice && form.sourceProformaId && (
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                This tax invoice will be linked to source proforma #{form.sourceProformaId}.
              </Alert>
            )}

            {requiresReference && (
              <Stack spacing={4}>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Reference Tax Invoice
                  </Text>
                  <ReferenceInvoiceSelect
                    value={form.referenceInvoiceId}
                    onChange={handleReferenceChange}
                    isDisabled={saving || loadingReferenceInvoice}
                  />
                </Box>

                {referenceInvoice && (
                  <Box borderWidth="1px" borderColor="orange.100" bg="orange.50" borderRadius="md" p={4}>
                    <Text fontWeight="600">{referenceInvoice.invoiceNo}</Text>
                    <Text fontSize="sm" color="gray.600">
                      Customer: {referenceInvoice.customerLegalName || "—"}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Date:{" "}
                      {referenceInvoice.invoiceDate
                        ? new Date(referenceInvoice.invoiceDate).toLocaleDateString()
                        : "—"}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Amount: {formatCurrency(referenceInvoice.totalInvoiceAmount)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Tax Type: {referenceInvoice.taxType || "—"}
                    </Text>
                  </Box>
                )}
              </Stack>
            )}

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Customer
                </Text>
                <CustomerSelect
                  value={form.customerId}
                  onChange={(value) => handleHeaderChange("customerId", value)}
                  isDisabled={loading || saving || requiresReference || !!form.sourceProformaId}
                />
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Date
                </Text>
                <Input
                  type="date"
                  value={form.invoiceDate}
                  onChange={(e) => handleHeaderChange("invoiceDate", e.target.value)}
                  isDisabled={loading || saving}
                />
              </Box>
            </Grid>

            {isProforma && (
              <Box maxW={{ base: "100%", md: "320px" }}>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Valid Until
                </Text>
                <Input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => handleHeaderChange("validUntil", e.target.value)}
                  isDisabled={loading || saving}
                />
              </Box>
            )}

            {selectedCustomer && (
              <Box borderWidth="1px" borderColor="blue.100" bg="blue.50" borderRadius="md" p={4}>
                <Text fontWeight="600">{selectedCustomer.legalName || selectedCustomer.name}</Text>
                <Text fontSize="sm" color="gray.600">
                  {selectedCustomer.gstin || "No GSTIN"} • Payment Terms:{" "}
                  {selectedCustomer.paymentTermsDays ?? 0} days
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {selectedCustomer.billingAddressLine1 || selectedCustomer.addressLine1 || "—"}
                </Text>
              </Box>
            )}

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Notes
                </Text>
                <Textarea
                  value={form.notes}
                  onChange={(e) => handleHeaderChange("notes", e.target.value)}
                  rows={3}
                  placeholder="Optional notes"
                  isDisabled={loading || saving}
                />
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Terms and Conditions
                </Text>
                <Textarea
                  value={form.termsAndConditions}
                  onChange={(e) => handleHeaderChange("termsAndConditions", e.target.value)}
                  rows={3}
                  placeholder="Terms and conditions"
                  isDisabled={loading || saving}
                />
              </Box>
            </Grid>
          </Stack>
        </CardBody>
      </Card>

      <Card borderWidth="1px" borderColor="gray.200" shadow="sm" borderRadius="xl">
        <CardBody>
          <Stack spacing={5}>
            <Flex justify="space-between" align="center">
              <Heading size="md">Line Items</Heading>
              <Button leftIcon={<Plus size={16} />} variant="outline" onClick={addLine}>
                Add Line
              </Button>
            </Flex>

            <Box overflowX="auto">
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th width="20%">Product</Th>
                    <Th width="20%">Description</Th>
                    <Th isNumeric>Qty</Th>
                    <Th isNumeric>Unit Price</Th>
                    <Th>HSN/SAC</Th>
                    <Th>Unit</Th>
                    <Th isNumeric>GST %</Th>
                    <Th isNumeric>Taxable</Th>
                    <Th isNumeric>Tax</Th>
                    <Th isNumeric>Total</Th>
                    <Th width="60px"></Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {computedLines.map((line, index) => (
                    <Tr key={index}>
                      <Td>
                        <ProductSelect
                          value={line.productId}
                          onChange={(value) => handleLineChange(index, "productId", value)}
                          isDisabled={loading || saving}
                        />
                      </Td>

                      <Td>
                        <Input
                          value={line.description}
                          onChange={(e) =>
                            handleLineChange(index, "description", e.target.value)
                          }
                          placeholder="Description"
                          isDisabled={loading || saving}
                        />
                      </Td>

                      <Td isNumeric>
                        <Input
                          type="number"
                          min={0}
                          step="0.001"
                          value={line.quantity}
                          onChange={(e) =>
                            handleLineChange(index, "quantity", e.target.value)
                          }
                          isDisabled={loading || saving}
                        />
                      </Td>

                      <Td isNumeric>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={line.unitPrice}
                          onChange={(e) =>
                            handleLineChange(index, "unitPrice", e.target.value)
                          }
                          isDisabled={loading || saving}
                        />
                      </Td>

                      <Td>{line.product?.hsnSacCode || line.product?.hsnSacId || "—"}</Td>
                      <Td>{line.product?.unitCode || line.product?.unitId || "—"}</Td>
                      <Td isNumeric>{Number(line.gstRate || 0).toFixed(2)}%</Td>
                      <Td isNumeric>{formatCurrency(line.taxable)}</Td>
                      <Td isNumeric>{formatCurrency(line.taxAmount)}</Td>
                      <Td isNumeric>{formatCurrency(line.lineTotal)}</Td>

                      <Td>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          icon={<Trash2 size={16} />}
                          aria-label="Remove line"
                          onClick={() => removeLine(index)}
                          isDisabled={form.lines.length === 1 || saving}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Stack>
        </CardBody>
      </Card>

      <Card borderWidth="1px" borderColor="gray.200" shadow="sm" borderRadius="xl">
        <CardBody>
          <Stack spacing={4}>
            <Heading size="md">Summary</Heading>
            <Divider />

            <Flex justify="space-between">
              <Text color="gray.600">Taxable Total</Text>
              <Text fontWeight="600">{formatCurrency(summary.taxableTotal)}</Text>
            </Flex>

            <Flex justify="space-between">
              <Text color="gray.600">Estimated Tax Total</Text>
              <Text fontWeight="600">{formatCurrency(summary.taxTotal)}</Text>
            </Flex>

            <Flex justify="space-between">
              <Text color="gray.600">Estimated Grand Total</Text>
              <Text fontWeight="700" fontSize="lg" color="blue.600">
                {formatCurrency(summary.grandTotal)}
              </Text>
            </Flex>

            <Text fontSize="sm" color="gray.500">
              Final tax breakup and document number will be computed by the backend.
            </Text>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}