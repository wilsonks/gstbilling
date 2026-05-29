import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Skeleton,
  Stack,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  createInvoiceSequence,
  updateInvoiceSequence,
} from "./invoiceSequenceApi";

const DOCUMENT_TYPES = [
  "TAX_INVOICE",
  "PROFORMA_INVOICE",
  "CREDIT_NOTE",
  "DEBIT_NOTE",
];

const RESET_POLICIES = ["FINANCIAL_YEAR", "NEVER"];

const initialForm = {
  companyId: "",
  documentType: "TAX_INVOICE",
  financialYear: "",
  prefix: "",
  suffix: "",
  paddingLength: 5,
  currentNumber: 0,
  resetPolicy: "FINANCIAL_YEAR",
  active: true,
};

function buildFinancialYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (month >= 4) {
    return `${year}-${String((year + 1) % 100).padStart(2, "0")}`;
  }

  return `${year - 1}-${String(year % 100).padStart(2, "0")}`;
}

function formatDocumentType(type) {
  return type?.replaceAll("_", " ") || "—";
}

export default function InvoiceSequenceModal({
  isOpen,
  onClose,
  onSuccess,
  sequence = null,
  companies = [],
}) {
  const toast = useToast();

  const [form, setForm] = useState({
    ...initialForm,
    financialYear: buildFinancialYear(),
  });
  const [saving, setSaving] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [touched, setTouched] = useState({});

  const editing = !!sequence?.id;

  useEffect(() => {
    if (!isOpen) return;

    setLoadingForm(true);

    if (sequence) {
      setForm({
        companyId: sequence.companyId ?? "",
        documentType: sequence.documentType ?? "TAX_INVOICE",
        financialYear: sequence.financialYear ?? buildFinancialYear(),
        prefix: sequence.prefix ?? "",
        suffix: sequence.suffix ?? "",
        paddingLength: sequence.paddingLength ?? 5,
        currentNumber: sequence.currentNumber ?? 0,
        resetPolicy: sequence.resetPolicy ?? "FINANCIAL_YEAR",
        active: sequence.active ?? true,
      });
    } else {
      setForm({
        ...initialForm,
        companyId: companies[0]?.id ?? "",
        financialYear: buildFinancialYear(),
      });
    }

    setTouched({});
    setLoadingForm(false);
  }, [isOpen, sequence, companies]);

  const errors = useMemo(() => {
    const next = {};

    if (!String(form.companyId).trim()) next.companyId = "Company is required";
    if (!String(form.documentType).trim()) next.documentType = "Document type is required";
    if (!String(form.financialYear).trim()) next.financialYear = "Financial year is required";
    if (!String(form.prefix).trim()) next.prefix = "Prefix is required";

    if (form.paddingLength === "" || form.paddingLength === null) {
      next.paddingLength = "Padding length is required";
    } else if (Number(form.paddingLength) < 1) {
      next.paddingLength = "Padding length must be at least 1";
    }

    if (form.currentNumber === "" || form.currentNumber === null) {
      next.currentNumber = "Current number is required";
    } else if (Number(form.currentNumber) < 0) {
      next.currentNumber = "Current number cannot be negative";
    }

    if (!String(form.resetPolicy).trim()) next.resetPolicy = "Reset policy is required";

    return next;
  }, [form]);

  const preview = useMemo(() => {
    const prefix = String(form.prefix || "");
    const suffix = String(form.suffix || "");
    const nextNumber = Number(form.currentNumber || 0) + 1;
    const padded = String(nextNumber).padStart(Number(form.paddingLength || 1), "0");
    return `${prefix}${padded}${suffix}`;
  }, [form.prefix, form.suffix, form.currentNumber, form.paddingLength]);

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const buildPayload = () => ({
    companyId: Number(form.companyId),
    documentType: form.documentType,
    financialYear: String(form.financialYear || "").trim(),
    prefix: String(form.prefix || "").trim().toUpperCase(),
    suffix: String(form.suffix || "").trim().toUpperCase() || null,
    paddingLength: Number(form.paddingLength),
    currentNumber: Number(form.currentNumber),
    resetPolicy: form.resetPolicy,
    active: !!form.active,
  });

  const handleSubmit = async () => {
    setTouched({
      companyId: true,
      documentType: true,
      financialYear: true,
      prefix: true,
      paddingLength: true,
      currentNumber: true,
      resetPolicy: true,
    });

    if (!isValid) {
      toast({
        title: "Please fix the form errors",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();

      if (editing) {
        await updateInvoiceSequence(sequence.id, payload);
      } else {
        await createInvoiceSequence(payload);
      }

      toast({
        title: editing ? "Invoice sequence updated" : "Invoice sequence created",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast({
        title: editing
          ? "Failed to update invoice sequence"
          : "Failed to create invoice sequence",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const disableForm = saving || loadingForm;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader>
          {editing ? "Edit Invoice Sequence" : "Create Invoice Sequence"}
        </ModalHeader>
        <ModalCloseButton isDisabled={saving} />

        <ModalBody>
          <Stack spacing={5}>
            <Text color="gray.500" fontSize="sm">
              Configure company-wise invoice numbering and financial-year sequence control.
            </Text>

            {loadingForm ? (
              <Stack spacing={4}>
                <Skeleton height="40px" />
                <Skeleton height="40px" />
                <Skeleton height="40px" />
                <Skeleton height="72px" />
              </Stack>
            ) : (
              <>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormControl isRequired isInvalid={touched.companyId && !!errors.companyId}>
                    <FormLabel>Company</FormLabel>
                    <Select
                      value={form.companyId}
                      onChange={(e) => handleChange("companyId", e.target.value)}
                      onBlur={() => handleBlur("companyId")}
                      isDisabled={disableForm}
                      placeholder="Select company"
                    >
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.companyId}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isRequired
                    isInvalid={touched.documentType && !!errors.documentType}
                  >
                    <FormLabel>Document Type</FormLabel>
                    <Select
                      value={form.documentType}
                      onChange={(e) => handleChange("documentType", e.target.value)}
                      onBlur={() => handleBlur("documentType")}
                      isDisabled={disableForm}
                    >
                      {DOCUMENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {formatDocumentType(type)}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.documentType}</FormErrorMessage>
                  </FormControl>
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormControl
                    isRequired
                    isInvalid={touched.financialYear && !!errors.financialYear}
                  >
                    <FormLabel>Financial Year</FormLabel>
                    <Input
                      value={form.financialYear}
                      onChange={(e) => handleChange("financialYear", e.target.value)}
                      onBlur={() => handleBlur("financialYear")}
                      placeholder="e.g. 2026-27"
                      isDisabled={disableForm}
                    />
                    <FormErrorMessage>{errors.financialYear}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isRequired
                    isInvalid={touched.resetPolicy && !!errors.resetPolicy}
                  >
                    <FormLabel>Reset Policy</FormLabel>
                    <Select
                      value={form.resetPolicy}
                      onChange={(e) => handleChange("resetPolicy", e.target.value)}
                      onBlur={() => handleBlur("resetPolicy")}
                      isDisabled={disableForm}
                    >
                      {RESET_POLICIES.map((policy) => (
                        <option key={policy} value={policy}>
                          {formatDocumentType(policy)}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.resetPolicy}</FormErrorMessage>
                  </FormControl>
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={4}>
                  <FormControl isRequired isInvalid={touched.prefix && !!errors.prefix}>
                    <FormLabel>Prefix</FormLabel>
                    <Input
                      value={form.prefix}
                      onChange={(e) => handleChange("prefix", e.target.value)}
                      onBlur={() => handleBlur("prefix")}
                      placeholder="e.g. INV/2026-27/"
                      isDisabled={disableForm}
                    />
                    <FormErrorMessage>{errors.prefix}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Suffix</FormLabel>
                    <Input
                      value={form.suffix}
                      onChange={(e) => handleChange("suffix", e.target.value)}
                      placeholder="Optional suffix"
                      isDisabled={disableForm}
                    />
                  </FormControl>
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormControl
                    isRequired
                    isInvalid={touched.paddingLength && !!errors.paddingLength}
                  >
                    <FormLabel>Padding Length</FormLabel>
                    <Input
                      type="number"
                      min={1}
                      value={form.paddingLength}
                      onChange={(e) => handleChange("paddingLength", e.target.value)}
                      onBlur={() => handleBlur("paddingLength")}
                      isDisabled={disableForm}
                    />
                    <FormErrorMessage>{errors.paddingLength}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isRequired
                    isInvalid={touched.currentNumber && !!errors.currentNumber}
                  >
                    <FormLabel>Current Number</FormLabel>
                    <Input
                      type="number"
                      min={0}
                      value={form.currentNumber}
                      onChange={(e) => handleChange("currentNumber", e.target.value)}
                      onBlur={() => handleBlur("currentNumber")}
                      isDisabled={disableForm}
                    />
                    <FormErrorMessage>{errors.currentNumber}</FormErrorMessage>
                  </FormControl>
                </Grid>

                <Stack
                  spacing={1}
                  borderWidth="1px"
                  borderColor="blue.100"
                  bg="blue.50"
                  borderRadius="md"
                  p={4}
                >
                  <Text fontSize="sm" color="gray.600">
                    Next number preview
                  </Text>
                  <Text fontWeight="700" color="blue.700">
                    {preview}
                  </Text>
                </Stack>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Active</FormLabel>
                  <Switch
                    isChecked={!!form.active}
                    onChange={(e) => handleChange("active", e.target.checked)}
                    isDisabled={disableForm}
                  />
                </FormControl>
              </>
            )}
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={saving}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={saving}>
            {editing ? "Save Changes" : "Create Sequence"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}