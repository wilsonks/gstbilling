import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { ArrowLeft, FileText, RefreshCw, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cancelInvoice, getInvoiceById } from "./invoiceApi";

function InfoRow({ label, value, children }) {
  return (
    <Flex
      py={3}
      justify="space-between"
      align={{ base: "flex-start", md: "center" }}
      direction={{ base: "column", md: "row" }}
      gap={2}
    >
      <Text color="gray.500" minW="180px">
        {label}
      </Text>

      <Box textAlign={{ base: "left", md: "right" }} flex="1">
        {children || <Text fontWeight="500">{value || "—"}</Text>}
      </Box>
    </Flex>
  );
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

function formatLabel(value) {
  return value ? value.replaceAll("_", " ") : "—";
}

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInvoice = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);

    try {
      const data = await getInvoiceById(id);
      setInvoice(data);
    } catch (error) {
      toast({
        title: "Failed to load invoice",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setInvoice(null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const totals = useMemo(() => {
    if (!invoice) {
      return {
        totalQuantity: 0,
        lineCount: 0,
      };
    }

    return {
      totalQuantity: (invoice.lines || []).reduce(
        (sum, line) => sum + Number(line.quantity || 0),
        0
      ),
      lineCount: (invoice.lines || []).length,
    };
  }, [invoice]);

  const handleCancelInvoice = async () => {
    if (!invoice) return;

    setActionLoading(true);
    try {
      await cancelInvoice(invoice.id);

      toast({
        title: "Invoice cancelled",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      await fetchInvoice({ silent: true });
    } catch (error) {
      toast({
        title: "Failed to cancel invoice",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" py={16}>
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (!invoice) {
    return (
      <Card borderWidth="1px" borderColor="gray.200" shadow="sm" borderRadius="xl">
        <CardBody>
          <Stack spacing={3}>
            <Heading size="md">Invoice not found</Heading>
            <Text color="gray.500">
              The requested invoice could not be loaded.
            </Text>
            <HStack>
              <Button
                leftIcon={<ArrowLeft size={16} />}
                onClick={() => navigate("/invoices")}
              >
                Back to Invoices
              </Button>
            </HStack>
          </Stack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Stack spacing={6}>
      <Flex
        justify="space-between"
        align={{ base: "stretch", lg: "center" }}
        direction={{ base: "column", lg: "row" }}
        gap={4}
      >
        <Box>
          <HStack spacing={3} mb={2}>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<ArrowLeft size={14} />}
              onClick={() => navigate("/invoices")}
            >
              Back
            </Button>

            <Badge
              colorScheme={
                invoice.status === "CANCELLED"
                  ? "red"
                  : invoice.status === "ISSUED"
                  ? "green"
                  : "gray"
              }
              px={2}
              py={1}
            >
              {invoice.status || "—"}
            </Badge>
          </HStack>

          <Heading size="lg">{invoice.invoiceNo}</Heading>
          <Text color="gray.500" mt={1}>
            Invoice #{invoice.id}
          </Text>
        </Box>

        <HStack spacing={3} flexWrap="wrap">
          <Button
            leftIcon={<RefreshCw size={16} />}
            variant="outline"
            onClick={() => fetchInvoice({ silent: true })}
          >
            Refresh
          </Button>

          {invoice.status !== "CANCELLED" && (
            <Button
              leftIcon={<XCircle size={16} />}
              colorScheme="red"
              variant="outline"
              onClick={handleCancelInvoice}
              isLoading={actionLoading}
            >
              Cancel Invoice
            </Button>
          )}
        </HStack>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
        <GridItem>
          <Card borderWidth="1px" borderColor="gray.200" shadow="sm" borderRadius="xl">
            <CardBody>
              <Text color="gray.500" fontSize="sm">
                Grand Total
              </Text>
              <Text fontSize="2xl" fontWeight="700" mt={1}>
                {formatCurrency(invoice.totalInvoiceAmount)}
              </Text>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card borderWidth="1px" borderColor="gray.200" shadow="sm" borderRadius="xl">
            <CardBody>
              <Text color="gray.500" fontSize="sm">
                Taxable Amount
              </Text>
              <Text fontSize="2xl" fontWeight="700" mt={1}>
                {formatCurrency(invoice.totalTaxableAmount)}
              </Text>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card borderWidth="1px" borderColor="gray.200" shadow="sm" borderRadius="xl">
            <CardBody>
              <Text color="gray.500" fontSize="sm">
                Total Tax
              </Text>
              <Text fontSize="2xl" fontWeight="700" mt={1}>
                {formatCurrency(invoice.totalTaxAmount)}
              </Text>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card borderWidth="1px" borderColor="gray.200" shadow="sm" borderRadius="xl">
            <CardBody>
              <Text color="gray.500" fontSize="sm">
                Line Items
              </Text>
              <Text fontSize="2xl" fontWeight="700" mt={1}>
                {totals.lineCount}
              </Text>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={6}>
        <GridItem>
          <Card borderWidth="1px" borderColor="gray.200" shadow="sm" borderRadius="xl">
            <CardBody>
              <HStack spacing={3} mb={4}>
                <FileText size={18} />
                <Heading size="md">Invoice Information</Heading>
              </HStack>

              <Divider mb={2} />

              <InfoRow label="Invoice No" value={invoice.invoiceNo} />
              <Divider />

              <InfoRow label="Invoice Date" value={formatDate(invoice.invoiceDate)} />
              <Divider />

              <InfoRow label="Due Date" value={formatDate(invoice.dueDate)} />
              <Divider />

              <InfoRow label="Status" value={invoice.status} />
              <Divider />

              <InfoRow label="Tax Type" value={formatLabel(invoice.taxType)} />
              <Divider />

              <InfoRow
                label="Place of Supply State Code"
                value={invoice.placeOfSupplyStateCode}
              />
              <Divider />

              <InfoRow label="Notes" value={invoice.notes || "—"} />
              <Divider />

              <InfoRow
                label="Terms & Conditions"
                value={invoice.termsAndConditions || "—"}
              />
            </CardBody>
          </Card>

          <Card
            mt={6}
            borderWidth="1px"
            borderColor="gray.200"
            shadow="sm"
            borderRadius="xl"
          >
            <CardBody>
              <Heading size="md" mb={4}>
                Line Items
              </Heading>

              <Box overflowX="auto">
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th>#</Th>
                      <Th>Product</Th>
                      <Th>HSN/SAC</Th>
                      <Th>Unit</Th>
                      <Th isNumeric>Qty</Th>
                      <Th isNumeric>Unit Price</Th>
                      <Th isNumeric>Taxable</Th>
                      <Th isNumeric>GST %</Th>
                      <Th isNumeric>Total</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(invoice.lines || []).map((line) => (
                      <Tr key={line.id || `${line.lineNo}-${line.productId}`}>
                        <Td>{line.lineNo}</Td>

                        <Td>
                          <Stack spacing={0}>
                            <Text fontWeight="600">{line.productName || "—"}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {line.productCode || "—"}
                            </Text>
                            {line.description && (
                              <Text fontSize="xs" color="gray.500">
                                {line.description}
                              </Text>
                            )}
                          </Stack>
                        </Td>

                        <Td>{line.hsnSacCode || "—"}</Td>
                        <Td>{line.unitCode || "—"}</Td>
                        <Td isNumeric>{line.quantity ?? 0}</Td>
                        <Td isNumeric>{formatCurrency(line.unitPrice)}</Td>
                        <Td isNumeric>{formatCurrency(line.taxableAmount)}</Td>
                        <Td isNumeric>{Number(line.gstRate || 0).toFixed(2)}%</Td>
                        <Td isNumeric>{formatCurrency(line.lineTotalAmount)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Stack spacing={6}>
            <Card borderWidth="1px" borderColor="gray.200" shadow="sm" borderRadius="xl">
              <CardBody>
                <Heading size="md" mb={4}>
                  Customer Snapshot
                </Heading>

                <Divider mb={2} />

                <InfoRow label="Customer Code" value={invoice.customerCode} />
                <Divider />

                <InfoRow label="Legal Name" value={invoice.customerLegalName} />
                <Divider />

                <InfoRow label="Trade Name" value={invoice.customerTradeName || "—"} />
                <Divider />

                <InfoRow label="GSTIN" value={invoice.customerGstin || "—"} />
                <Divider />

                <InfoRow label="Billing Address Line 1" value={invoice.customerBillingAddressLine1 || "—"} />
                <Divider />

                <InfoRow label="Billing Address Line 2" value={invoice.customerBillingAddressLine2 || "—"} />
                <Divider />

                <InfoRow label="City" value={invoice.customerBillingCity || "—"} />
                <Divider />

                <InfoRow label="State" value={invoice.customerBillingState || "—"} />
                <Divider />

                <InfoRow label="State Code" value={invoice.customerBillingStateCode || "—"} />
                <Divider />

                <InfoRow label="Pincode" value={invoice.customerBillingPincode || "—"} />
                <Divider />

                <InfoRow label="Country" value={invoice.customerBillingCountry || "—"} />
              </CardBody>
            </Card>

            <Card borderWidth="1px" borderColor="gray.200" shadow="sm" borderRadius="xl">
              <CardBody>
                <Heading size="md" mb={4}>
                  Seller Snapshot
                </Heading>

                <Divider mb={2} />

                <InfoRow label="Legal Name" value={invoice.sellerLegalName} />
                <Divider />

                <InfoRow label="GSTIN" value={invoice.sellerGstin} />
                <Divider />

                <InfoRow label="Address Line 1" value={invoice.sellerAddressLine1 || "—"} />
                <Divider />

                <InfoRow label="Address Line 2" value={invoice.sellerAddressLine2 || "—"} />
                <Divider />

                <InfoRow label="City" value={invoice.sellerCity || "—"} />
                <Divider />

                <InfoRow label="State" value={invoice.sellerState || "—"} />
                <Divider />

                <InfoRow label="State Code" value={invoice.sellerStateCode || "—"} />
                <Divider />

                <InfoRow label="Pincode" value={invoice.sellerPincode || "—"} />
                <Divider />

                <InfoRow label="Country" value={invoice.sellerCountry || "—"} />
              </CardBody>
            </Card>

            <Card borderWidth="1px" borderColor="gray.200" shadow="sm" borderRadius="xl">
              <CardBody>
                <Heading size="md" mb={4}>
                  Tax Summary
                </Heading>

                <Divider mb={2} />

                <InfoRow label="Total Quantity" value={String(totals.totalQuantity)} />
                <Divider />

                <InfoRow
                  label="Taxable Amount"
                  value={formatCurrency(invoice.totalTaxableAmount)}
                />
                <Divider />

                <InfoRow
                  label="CGST"
                  value={formatCurrency(invoice.totalCgstAmount)}
                />
                <Divider />

                <InfoRow
                  label="SGST"
                  value={formatCurrency(invoice.totalSgstAmount)}
                />
                <Divider />

                <InfoRow
                  label="IGST"
                  value={formatCurrency(invoice.totalIgstAmount)}
                />
                <Divider />

                <InfoRow
                  label="Total Tax"
                  value={formatCurrency(invoice.totalTaxAmount)}
                />
                <Divider />

                <InfoRow
                  label="Grand Total"
                  value={formatCurrency(invoice.totalInvoiceAmount)}
                />
              </CardBody>
            </Card>
          </Stack>
        </GridItem>
      </Grid>
    </Stack>
  );
}