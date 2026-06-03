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
  Link as ChakraLink,
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
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  cancelInvoice,
  convertProformaToTaxInvoice,
  exportInvoicePdf,
  getInvoiceById,
  previewInvoicePdf,
} from "../invoiceApi";
import { resolveDocumentListPath } from "../documentRoutes";

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

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-IN");
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
    <Card variant="outline">
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

function resolveDetailPath(documentType, id) {
  switch (documentType) {
    case "PROFORMA_INVOICE":
      return `/proforma-invoices/${id}`;
    case "CREDIT_NOTE":
      return `/credit-notes/${id}`;
    case "DEBIT_NOTE":
      return `/debit-notes/${id}`;
    case "TAX_INVOICE":
    default:
      return `/invoices/${id}`;
  }
}

function statusColorScheme(status) {
  switch (status) {
    case "CANCELLED":
      return "red";
    case "ISSUED":
      return "green";
    case "CONVERTED":
      return "purple";
    case "EXPIRED":
      return "orange";
    default:
      return "gray";
  }
}

export default function DocumentDetailsPage({
  expectedDocumentType,
  title,
  embedded = false,
  onClose,
}) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [converting, setConverting] = useState(false);

  const handleBack = () => {
    if (embedded && onClose) {
      onClose();
      return;
    }

    if (!invoice) {
      navigate("/invoices");
      return;
    }

    navigate(resolveDocumentListPath(invoice.documentType || "TAX_INVOICE"));
  };

  const handlePrint = async (currentInvoice = invoice) => {
    if (!currentInvoice?.id) return;

    try {
      const response = await previewInvoicePdf(currentInvoice.id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const newWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (!newWindow) {
        toast({
          title: "Popup blocked",
          description: "Please allow popups to preview the PDF.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (error) {
      toast({
        title: "Failed to open PDF",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = async () => {
    if (!invoice?.id || invoice.status === "CANCELLED") return;

    setCancelling(true);
    try {
      const updated = await cancelInvoice(invoice.id);

      toast({
        title: "Document cancelled",
        description: `${updated.invoiceNo || invoice.invoiceNo || "Document"} cancelled successfully.`,
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      if (embedded && onClose) {
        onClose();
        return;
      }

      navigate(resolveDocumentListPath(updated.documentType || invoice.documentType || "TAX_INVOICE"));
    } catch (error) {
      toast({
        title: "Failed to cancel document",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleConvertToTaxInvoice = async () => {
    if (!invoice?.id) return;

    setConverting(true);
    try {
      const converted = await convertProformaToTaxInvoice(invoice.id);

      toast({
        title: "Converted to tax invoice",
        description: `${converted.invoiceNo || "Tax invoice"} created successfully.`,
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      navigate(resolveDetailPath(converted.documentType, converted.id), {
        state: {
          backgroundLocation: location.state?.backgroundLocation || location,
          returnTo: resolveDetailPath(invoice.documentType, invoice.id),
        },
      });
    } catch (error) {
      toast({
        title: "Failed to convert proforma invoice",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setConverting(false);
    }
  };

  const handleCreateCreditNote = () => {
    if (!invoice?.id) return;
    navigate("/credit-notes/new", {
      state: {
        backgroundLocation: location.state?.backgroundLocation || location,
        referenceInvoiceId: invoice.id,
        returnTo: resolveDetailPath(invoice.documentType, invoice.id),
      },
    });
  };

  const handleCreateDebitNote = () => {
    if (!invoice?.id) return;
    navigate("/debit-notes/new", {
      state: {
        backgroundLocation: location.state?.backgroundLocation || location,
        referenceInvoiceId: invoice.id,
        returnTo: resolveDetailPath(invoice.documentType, invoice.id),
      },
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getInvoiceById(id);
        const actualDocumentType = data?.documentType || "TAX_INVOICE";

        if (
          expectedDocumentType &&
          actualDocumentType !== expectedDocumentType
        ) {
          const redirectPath = resolveDetailPath(actualDocumentType, data.id);

          navigate(`${redirectPath}${location.search || ""}`, {
            replace: true,
            state: location.state,
          });

          return;
        }

        setInvoice(data);
      } catch (error) {
        toast({
          title: "Failed to load document",
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
  }, [id, expectedDocumentType, navigate, location.search, location.state, toast]);

  useEffect(() => {
    if (!invoice) return;

    const params = new URLSearchParams(location.search);
    if (params.get("print") === "1") {
      handlePrint(invoice);
    }
  }, [invoice, location.search]);

  const lines = useMemo(() => invoice?.lines || [], [invoice]);
  const isNote =
    invoice?.documentType === "CREDIT_NOTE" ||
    invoice?.documentType === "DEBIT_NOTE";
  const isProforma = invoice?.documentType === "PROFORMA_INVOICE";
  const isTaxInvoice = invoice?.documentType === "TAX_INVOICE";

  const canCreateNotes =
    isTaxInvoice &&
    invoice?.status !== "CANCELLED";

  const canConvertProforma =
    isProforma &&
    invoice?.status !== "CANCELLED" &&
    invoice?.status !== "CONVERTED" &&
    invoice?.status !== "EXPIRED" &&
    !invoice?.convertedToInvoiceId;

  const canCancel =
    invoice?.status !== "CANCELLED" &&
    !(isProforma && invoice?.convertedToInvoiceId);

  const handleDownloadPdf = async () => {
    if (!invoice?.id) return;

    setDownloading(true);
    try {
      const response = await exportInvoicePdf(invoice.id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      let fileName = `${invoice.invoiceNo || "document"}.pdf`;
      const disposition = response.headers?.["content-disposition"];
      const match = disposition?.match(/filename="(.+)"/);
      if (match?.[1]) fileName = match[1];

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Failed to export PDF",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDownloading(false);
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
    return <Text>Document not found.</Text>;
  }

  return (
    <Stack spacing={6}>
      {!embedded && (
        <Flex
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
              onClick={handleBack}
              mb={3}
            >
              Back
            </Button>
            <Heading size="lg">{invoice.invoiceNo || title}</Heading>
            <Text color="gray.500" mt={1}>
              View document details, PDF preview, and export.
            </Text>
          </Box>

          <HStack spacing={3} flexWrap="wrap">
            {canConvertProforma && (
              <Button
                colorScheme="blue"
                variant="outline"
                onClick={handleConvertToTaxInvoice}
                isLoading={converting}
              >
                Convert to Tax Invoice
              </Button>
            )}

            {canCreateNotes && (
              <>
                <Button variant="outline" colorScheme="teal" onClick={handleCreateCreditNote}>
                  Create Credit Note
                </Button>
                <Button variant="outline" colorScheme="orange" onClick={handleCreateDebitNote}>
                  Create Debit Note
                </Button>
              </>
            )}

            <Button
              variant="outline"
              leftIcon={<Printer size={16} />}
              onClick={() => handlePrint()}
            >
              Print
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
            {canCancel && (
              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleCancel}
                isLoading={cancelling}
              >
                Cancel
              </Button>
            )}
          </HStack>
        </Flex>
      )}

      {embedded && (
        <Flex justify="flex-end">
          <HStack spacing={3} flexWrap="wrap">
            {canConvertProforma && (
              <Button
                colorScheme="blue"
                variant="outline"
                onClick={handleConvertToTaxInvoice}
                isLoading={converting}
              >
                Convert to Tax Invoice
              </Button>
            )}

            {canCreateNotes && (
              <>
                <Button variant="outline" colorScheme="teal" onClick={handleCreateCreditNote}>
                  Create Credit Note
                </Button>
                <Button variant="outline" colorScheme="orange" onClick={handleCreateDebitNote}>
                  Create Debit Note
                </Button>
              </>
            )}

            <Button
              variant="outline"
              leftIcon={<Printer size={16} />}
              onClick={() => handlePrint()}
            >
              Print
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
            {canCancel && (
              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleCancel}
                isLoading={cancelling}
              >
                Cancel
              </Button>
            )}
          </HStack>
        </Flex>
      )}

      <Card borderWidth="1px" borderColor="gray.200" shadow="sm" borderRadius="xl">
        <CardBody>
          <Stack spacing={6}>
            <Flex justify="space-between" align="flex-start" wrap="wrap" gap={4}>
              <Box>
                <Text
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  color="gray.500"
                >
                  {title}
                </Text>
                <Heading size="lg" mt={1}>
                  {invoice.invoiceNo || "—"}
                </Heading>
                <Text color="gray.500" mt={1}>
                  Date: {formatDate(invoice.invoiceDate)}
                </Text>
                {isProforma && (
                  <Text color="gray.500" mt={1}>
                    Valid Until: {formatDate(invoice.validUntil)}
                  </Text>
                )}
              </Box>

              <Badge colorScheme={statusColorScheme(invoice.status)}>
                {invoice.status || "—"}
              </Badge>
            </Flex>

            {isProforma && invoice.convertedToInvoiceId && (
              <Card variant="outline">
                <CardBody>
                  <Stack spacing={2}>
                    <Heading size="sm">Converted Tax Invoice</Heading>
                    <ChakraLink
                      as={RouterLink}
                      to={`/invoices/${invoice.convertedToInvoiceId}`}
                      color="blue.600"
                      fontWeight="600"
                      state={{
                        backgroundLocation: location.state?.backgroundLocation || location,
                        returnTo: resolveDetailPath(invoice.documentType, invoice.id),
                      }}
                    >
                      View Tax Invoice #{invoice.convertedToInvoiceId}
                    </ChakraLink>
                    <Text fontSize="sm" color="gray.600">
                      Converted At: {formatDateTime(invoice.convertedAt)}
                    </Text>
                  </Stack>
                </CardBody>
              </Card>
            )}

            {isTaxInvoice && invoice.sourceProformaId && (
              <Card variant="outline">
                <CardBody>
                  <Stack spacing={2}>
                    <Heading size="sm">Source Proforma Invoice</Heading>
                    <ChakraLink
                      as={RouterLink}
                      to={`/proforma-invoices/${invoice.sourceProformaId}`}
                      color="blue.600"
                      fontWeight="600"
                      state={{
                        backgroundLocation: location.state?.backgroundLocation || location,
                        returnTo: resolveDetailPath(invoice.documentType, invoice.id),
                      }}
                    >
                      View Proforma #{invoice.sourceProformaId}
                    </ChakraLink>
                  </Stack>
                </CardBody>
              </Card>
            )}

            {isNote && invoice.referenceInvoiceId && (
              <Card variant="outline">
                <CardBody>
                  <Stack spacing={2}>
                    <Heading size="sm">Reference Tax Invoice</Heading>
                    <ChakraLink
                      as={RouterLink}
                      to={`/invoices/${invoice.referenceInvoiceId}`}
                      color="blue.600"
                      fontWeight="600"
                      state={{
                        backgroundLocation: location.state?.backgroundLocation || location,
                        returnTo: resolveDetailPath(invoice.documentType, invoice.id),
                      }}
                    >
                      {invoice.referenceInvoiceNo || `Invoice #${invoice.referenceInvoiceId}`}
                    </ChakraLink>
                  </Stack>
                </CardBody>
              </Card>
            )}

            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
              <GridItem>
                <PrintSection title="Seller">
                  <Text fontWeight="700">{invoice.sellerLegalName || "—"}</Text>
                  <Text color="gray.600">GSTIN: {invoice.sellerGstin || "—"}</Text>
                </PrintSection>
              </GridItem>

              <GridItem>
                <PrintSection title="Customer">
                  <Text fontWeight="700">{invoice.customerLegalName || "—"}</Text>
                  <Text color="gray.600">GSTIN: {invoice.customerGstin || "—"}</Text>
                </PrintSection>
              </GridItem>
            </Grid>

            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
              <GridItem>
                <PrintSection title="Summary">
                  <Flex justify="space-between">
                    <Text color="gray.500">No</Text>
                    <Text fontWeight="600">{invoice.invoiceNo || "—"}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.500">Date</Text>
                    <Text fontWeight="600">{formatDate(invoice.invoiceDate)}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.500">Due Date</Text>
                    <Text fontWeight="600">{formatDate(invoice.dueDate)}</Text>
                  </Flex>
                  {isProforma && (
                    <Flex justify="space-between">
                      <Text color="gray.500">Valid Until</Text>
                      <Text fontWeight="600">{formatDate(invoice.validUntil)}</Text>
                    </Flex>
                  )}
                  <Flex justify="space-between">
                    <Text color="gray.500">Tax Type</Text>
                    <Text fontWeight="600">{invoice.taxType || "—"}</Text>
                  </Flex>
                </PrintSection>
              </GridItem>

              <GridItem>
                <PrintSection title="Amount Summary">
                  <Flex justify="space-between">
                    <Text color="gray.500">Taxable Amount</Text>
                    <Text fontWeight="600">{formatCurrency(invoice.totalTaxableAmount)}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.500">Total Tax</Text>
                    <Text fontWeight="600">{formatCurrency(invoice.totalTaxAmount)}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.500">Grand Total</Text>
                    <Text fontWeight="700" color="blue.600">
                      {formatCurrency(invoice.totalInvoiceAmount)}
                    </Text>
                  </Flex>
                </PrintSection>
              </GridItem>
            </Grid>

            <Card variant="outline">
              <CardBody>
                <Stack spacing={4}>
                  <Heading size="sm">Line Items</Heading>
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>#</Th>
                          <Th>Product</Th>
                          <Th>Description</Th>
                          <Th>Qty</Th>
                          <Th isNumeric>Price</Th>
                          <Th isNumeric>Taxable</Th>
                          <Th isNumeric>GST %</Th>
                          <Th isNumeric>Tax</Th>
                          <Th isNumeric>Total</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {lines.map((line) => (
                          <Tr key={line.id || line.lineNo}>
                            <Td>{line.lineNo || "—"}</Td>
                            <Td>{line.productName || "—"}</Td>
                            <Td>{line.description || "—"}</Td>
                            <Td>{formatNumber(line.quantity, 3)}</Td>
                            <Td isNumeric>{formatCurrency(line.unitPrice)}</Td>
                            <Td isNumeric>{formatCurrency(line.taxableAmount)}</Td>
                            <Td isNumeric>{formatNumber(line.gstRate, 2)}%</Td>
                            <Td isNumeric>{formatCurrency(taxAmount(line))}</Td>
                            <Td isNumeric>{formatCurrency(line.lineTotalAmount)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}