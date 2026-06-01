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
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  exportInvoicePdf,
  previewInvoicePdf,
  getInvoiceById,
} from "./invoiceApi";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatNumber(value, digits = 2) {
  return Number(value || 0).toFixed(digits);
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-IN");
  } catch {
    return value;
  }
}

function taxAmount(line) {
  return (
    Number(line.cgstAmount || 0) +
    Number(line.sgstAmount || 0) +
    Number(line.igstAmount || 0)
  );
}

function PrintSection({ title, children }) {
  return (
    <Card
      variant="outline"
      sx={{
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      <CardBody>
        <Stack spacing={3}>
          <Heading size="sm">{title}</Heading>
          <Divider />
          {children}
        </Stack>
      </CardBody>
    </Card>
  );
}

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
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
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, toast]);

  useEffect(() => {
    if (!invoice) return;

    const params = new URLSearchParams(location.search);
    const shouldPrint = params.get("print") === "1";

    if (shouldPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [invoice, location.search]);

  const lines = useMemo(() => invoice?.lines || [], [invoice]);

  const handleDownloadPdf = async () => {
    if (!invoice?.id) return;

    setDownloading(true);
    try {
      const response = await exportInvoicePdf(invoice.id);

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      let fileName = `${invoice.invoiceNo || "invoice"}.pdf`;
      const disposition = response.headers?.["content-disposition"];
      const match = disposition?.match(/filename="(.+)"/);
      if (match?.[1]) {
        fileName = match[1];
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Failed to export invoice PDF",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDownloading(false);
    }
  };

  // const handlePrint = () => {
  //   window.print();
  // };

  const handlePrint = async () => {
    if (!invoice?.id) return;

    try {
      const response = await previewInvoicePdf(invoice.id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const newWindow = window.open(url, "_blank", "noopener,noreferrer");

      if (!newWindow) {
        toast({
          title: "Popup blocked",
          description: "Please allow popups to preview the invoice PDF.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      toast({
        title: "Failed to open invoice PDF",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Flex justify="center" py={12}>
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (!invoice) {
    return (
      <Stack spacing={4}>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<ArrowLeft size={14} />}
          onClick={() => navigate("/invoices")}
          width="fit-content"
        >
          Back
        </Button>
        <Text>Invoice not found.</Text>
      </Stack>
    );
  }

  return (
    <Stack spacing={6}>
      <Flex
        className="no-print"
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Box>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<ArrowLeft size={14} />}
            onClick={() => navigate("/invoices")}
            mb={3}
          >
            Back
          </Button>
          <Heading size="lg">{invoice.invoiceNo || "Invoice"}</Heading>
          <Text color="gray.500" mt={1}>
            View invoice details, print-friendly layout, and PDF export.
          </Text>
        </Box>

        <HStack spacing={3} flexWrap="wrap">
          <Button
            variant="outline"
            leftIcon={<Printer size={16} />}
            onClick={handlePrint}
          >
            Print Invoice
          </Button>

          <Button
            colorScheme="blue"
            variant="outline"
            leftIcon={<Download size={16} />}
            onClick={handleDownloadPdf}
            isLoading={downloading}
          >
            Download PDF
          </Button>
        </HStack>
      </Flex>

      <Box
        className="print-container"
        bg="white"
        borderRadius="xl"
        sx={{
          "@media print": {
            bg: "white",
            p: 0,
          },
        }}
      >
        <Stack spacing={6}>
          <Card
            borderWidth="1px"
            borderColor="gray.200"
            shadow="sm"
            borderRadius="xl"
            sx={{
              "@media print": {
                borderWidth: "0",
                boxShadow: "none",
                borderRadius: "0",
              },
            }}
          >
            <CardBody>
              <Stack spacing={6}>
                <Flex
                  justify="space-between"
                  align="flex-start"
                  wrap="wrap"
                  gap={4}
                  sx={{
                    breakInside: "avoid",
                    pageBreakInside: "avoid",
                  }}
                >
                  <Box>
                    <Text
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wide"
                      color="gray.500"
                    >
                      Tax Invoice
                    </Text>
                    <Heading size="lg" mt={1}>
                      {invoice.invoiceNo || "—"}
                    </Heading>
                    <Text color="gray.500" mt={1}>
                      Invoice Date: {formatDate(invoice.invoiceDate)}
                    </Text>
                  </Box>

                  <Badge
                    colorScheme={
                      invoice.status === "CANCELLED"
                        ? "red"
                        : invoice.status === "ISSUED"
                          ? "green"
                          : "gray"
                    }
                    fontSize="0.85em"
                    px={3}
                    py={1}
                    borderRadius="md"
                    width="fit-content"
                  >
                    {invoice.status || "—"}
                  </Badge>
                </Flex>

                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <GridItem>
                    <PrintSection title="Seller">
                      <Text fontWeight="700">
                        {invoice.sellerLegalName || "—"}
                      </Text>
                      <Text color="gray.600">
                        GSTIN: {invoice.sellerGstin || "—"}
                      </Text>
                      <Text color="gray.600">
                        {[
                          invoice.sellerAddressLine1,
                          invoice.sellerAddressLine2,
                          invoice.sellerCity,
                          invoice.sellerState,
                          invoice.sellerPincode,
                          invoice.sellerCountry,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </Text>
                      <Text color="gray.600">
                        State Code: {invoice.sellerStateCode || "—"}
                      </Text>
                    </PrintSection>
                  </GridItem>

                  <GridItem>
                    <PrintSection title="Customer">
                      <Text fontWeight="700">
                        {invoice.customerLegalName || "—"}
                      </Text>
                      <Text color="gray.600">
                        Trade Name: {invoice.customerTradeName || "—"}
                      </Text>
                      <Text color="gray.600">
                        GSTIN: {invoice.customerGstin || "—"}
                      </Text>
                      <Text color="gray.600">
                        {[
                          invoice.customerBillingAddressLine1,
                          invoice.customerBillingAddressLine2,
                          invoice.customerBillingCity,
                          invoice.customerBillingState,
                          invoice.customerBillingPincode,
                          invoice.customerBillingCountry,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </Text>
                      <Text color="gray.600">
                        State Code: {invoice.customerBillingStateCode || "—"}
                      </Text>
                    </PrintSection>
                  </GridItem>
                </Grid>

                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <GridItem>
                    <PrintSection title="Invoice Summary">
                      <Flex justify="space-between">
                        <Text color="gray.500">Invoice No</Text>
                        <Text fontWeight="600">{invoice.invoiceNo || "—"}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">Invoice Date</Text>
                        <Text fontWeight="600">
                          {formatDate(invoice.invoiceDate)}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">Due Date</Text>
                        <Text fontWeight="600">
                          {formatDate(invoice.dueDate)}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">Tax Type</Text>
                        <Text fontWeight="600">{invoice.taxType || "—"}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">Place of Supply</Text>
                        <Text fontWeight="600">
                          {invoice.placeOfSupplyStateCode || "—"}
                        </Text>
                      </Flex>
                    </PrintSection>
                  </GridItem>

                  <GridItem>
                    <PrintSection title="Amount Summary">
                      <Flex justify="space-between">
                        <Text color="gray.500">Taxable Amount</Text>
                        <Text fontWeight="600">
                          {formatCurrency(invoice.totalTaxableAmount)}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">CGST</Text>
                        <Text fontWeight="600">
                          {formatCurrency(invoice.totalCgstAmount)}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">SGST</Text>
                        <Text fontWeight="600">
                          {formatCurrency(invoice.totalSgstAmount)}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">IGST</Text>
                        <Text fontWeight="600">
                          {formatCurrency(invoice.totalIgstAmount)}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">Total Tax</Text>
                        <Text fontWeight="600">
                          {formatCurrency(invoice.totalTaxAmount)}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.500">Invoice Total</Text>
                        <Text fontWeight="700" color="blue.600">
                          {formatCurrency(invoice.totalInvoiceAmount)}
                        </Text>
                      </Flex>
                    </PrintSection>
                  </GridItem>
                </Grid>

                <Card
                  variant="outline"
                  sx={{
                    breakInside: "avoid",
                    pageBreakInside: "avoid",
                  }}
                >
                  <CardBody>
                    <Stack spacing={4}>
                      <Heading size="sm">Line Items</Heading>

                      <Box overflowX="auto">
                        <Table
                          variant="simple"
                          size="sm"
                          sx={{
                            "@media print": {
                              fontSize: "11px",
                            },
                          }}
                        >
                          <Thead>
                            <Tr>
                              <Th>#</Th>
                              <Th>Product</Th>
                              <Th>Description</Th>
                              <Th>HSN/SAC</Th>
                              <Th>Unit</Th>
                              <Th isNumeric>Qty</Th>
                              <Th isNumeric>Price</Th>
                              <Th isNumeric>Taxable</Th>
                              <Th isNumeric>GST %</Th>
                              <Th isNumeric>Tax</Th>
                              <Th isNumeric>Total</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {lines.length === 0 ? (
                              <Tr>
                                <Td colSpan={11}>
                                  <Text
                                    color="gray.500"
                                    textAlign="center"
                                    py={4}
                                  >
                                    No invoice lines found.
                                  </Text>
                                </Td>
                              </Tr>
                            ) : (
                              lines.map((line) => (
                                <Tr
                                  key={line.id || line.lineNo}
                                  sx={{
                                    breakInside: "avoid",
                                    pageBreakInside: "avoid",
                                  }}
                                >
                                  <Td>{line.lineNo || "—"}</Td>
                                  <Td>
                                    <Text fontWeight="600">
                                      {line.productName || "—"}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {line.productCode || ""}
                                    </Text>
                                  </Td>
                                  <Td>{line.description || "—"}</Td>
                                  <Td>{line.hsnSacCode || "—"}</Td>
                                  <Td>{line.unitCode || "—"}</Td>
                                  <Td isNumeric>
                                    {formatNumber(line.quantity, 3)}
                                  </Td>
                                  <Td isNumeric>
                                    {formatCurrency(line.unitPrice)}
                                  </Td>
                                  <Td isNumeric>
                                    {formatCurrency(line.taxableAmount)}
                                  </Td>
                                  <Td isNumeric>
                                    {formatNumber(line.gstRate, 2)}%
                                  </Td>
                                  <Td isNumeric>
                                    {formatCurrency(taxAmount(line))}
                                  </Td>
                                  <Td isNumeric>
                                    {formatCurrency(line.lineTotalAmount)}
                                  </Td>
                                </Tr>
                              ))
                            )}
                          </Tbody>
                        </Table>
                      </Box>
                    </Stack>
                  </CardBody>
                </Card>

                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <GridItem>
                    <PrintSection title="Notes">
                      <Text color="gray.700" whiteSpace="pre-wrap">
                        {invoice.notes || "—"}
                      </Text>
                    </PrintSection>
                  </GridItem>

                  <GridItem>
                    <PrintSection title="Terms and Conditions">
                      <Text color="gray.700" whiteSpace="pre-wrap">
                        {invoice.termsAndConditions || "—"}
                      </Text>
                    </PrintSection>
                  </GridItem>
                </Grid>

                <Flex
                  justify="flex-end"
                  pt={2}
                  sx={{
                    breakInside: "avoid",
                    pageBreakInside: "avoid",
                  }}
                >
                  <Box textAlign="right">
                    <Text fontSize="sm" color="gray.500">
                      This is a system-generated invoice.
                    </Text>
                  </Box>
                </Flex>
              </Stack>
            </CardBody>
          </Card>
        </Stack>
      </Box>
    </Stack>
  );
}
