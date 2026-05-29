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
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { createCompany, updateCompany } from "./companyApi";

const COMPANY_TYPES = [
  "PROPRIETORSHIP",
  "PARTNERSHIP",
  "LLP",
  "PRIVATE_LIMITED",
  "PUBLIC_LIMITED",
  "TRUST",
  "SOCIETY",
  "GOVERNMENT_ENTITY",
];

const initialForm = {
  name: "",
  legalName: "",
  tradeName: "",
  gstin: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  type: "PRIVATE_LIMITED",
  active: true,
};

const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export default function TenantCompanyFormModal({
  isOpen,
  onClose,
  onSuccess,
  company = null,
}) {
  const toast = useToast();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [touched, setTouched] = useState({});

  const editing = !!company?.id;

  useEffect(() => {
    if (!isOpen) return;

    setLoadingForm(true);

    if (company) {
      setForm({
        name: company.name ?? "",
        legalName: company.legalName ?? "",
        tradeName: company.tradeName ?? "",
        gstin: company.gstin ?? "",
        email: company.email ?? "",
        phone: company.phone ?? "",
        addressLine1: company.addressLine1 ?? "",
        addressLine2: company.addressLine2 ?? "",
        city: company.city ?? "",
        state: company.state ?? "",
        pincode: company.pincode ?? "",
        country: company.country ?? "India",
        type: company.type ?? "PRIVATE_LIMITED",
        active: company.active ?? true,
      });
    } else {
      setForm(initialForm);
    }

    setTouched({});
    setLoadingForm(false);
  }, [isOpen, company]);

  const errors = useMemo(() => {
    const next = {};

    if (!String(form.name).trim()) next.name = "Company name is required";

    if (!String(form.gstin).trim()) {
      next.gstin = "GSTIN is required";
    } else if (!GSTIN_REGEX.test(String(form.gstin).trim().toUpperCase())) {
      next.gstin = "Enter a valid GSTIN";
    }

    if (!String(form.type).trim()) next.type = "Company type is required";

    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.email).trim())
    ) {
      next.email = "Enter a valid email address";
    }

    return next;
  }, [form]);

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
    name: String(form.name || "").trim(),
    legalName: String(form.legalName || "").trim() || null,
    tradeName: String(form.tradeName || "").trim() || null,
    gstin: String(form.gstin || "").trim().toUpperCase(),
    email: String(form.email || "").trim().toLowerCase() || null,
    phone: String(form.phone || "").trim() || null,
    addressLine1: String(form.addressLine1 || "").trim() || null,
    addressLine2: String(form.addressLine2 || "").trim() || null,
    city: String(form.city || "").trim() || null,
    state: String(form.state || "").trim() || null,
    pincode: String(form.pincode || "").trim() || null,
    country: String(form.country || "").trim() || "India",
    type: form.type,
    active: !!form.active,
  });

  const handleSubmit = async () => {
    setTouched({
      name: true,
      gstin: true,
      type: true,
      email: true,
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
        await updateCompany(company.id, payload);
      } else {
        await createCompany(payload);
      }

      toast({
        title: editing ? "Company updated" : "Company created",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast({
        title: editing ? "Failed to update company" : "Failed to create company",
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
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader>{editing ? "Edit Company" : "Create Company"}</ModalHeader>
        <ModalCloseButton isDisabled={saving} />

        <ModalBody>
          <Stack spacing={5}>
            <Text color="gray.500" fontSize="sm">
              Create and maintain invoice-ready company profiles for tenant operations.
            </Text>

            {loadingForm ? (
              <Stack spacing={4}>
                <Skeleton height="40px" />
                <Skeleton height="40px" />
                <Skeleton height="80px" />
                <Skeleton height="80px" />
              </Stack>
            ) : (
              <>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
                  <FormControl isRequired isInvalid={touched.name && !!errors.name}>
                    <FormLabel>Company Name</FormLabel>
                    <Input
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      placeholder="Enter company name"
                      isDisabled={disableForm}
                    />
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Legal Name</FormLabel>
                    <Input
                      value={form.legalName}
                      onChange={(e) => handleChange("legalName", e.target.value)}
                      placeholder="Enter legal name"
                      isDisabled={disableForm}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Trade Name</FormLabel>
                    <Input
                      value={form.tradeName}
                      onChange={(e) => handleChange("tradeName", e.target.value)}
                      placeholder="Enter trade name"
                      isDisabled={disableForm}
                    />
                  </FormControl>
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
                  <FormControl isRequired isInvalid={touched.gstin && !!errors.gstin}>
                    <FormLabel>GSTIN</FormLabel>
                    <Input
                      value={form.gstin}
                      onChange={(e) => handleChange("gstin", e.target.value.toUpperCase())}
                      onBlur={() => handleBlur("gstin")}
                      placeholder="Enter GSTIN"
                      maxLength={15}
                      isDisabled={disableForm}
                    />
                    <FormErrorMessage>{errors.gstin}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder="Enter email"
                      isDisabled={disableForm}
                    />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Phone</FormLabel>
                    <Input
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="Enter phone"
                      isDisabled={disableForm}
                    />
                  </FormControl>
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormControl isRequired isInvalid={touched.type && !!errors.type}>
                    <FormLabel>Company Type</FormLabel>
                    <Select
                      value={form.type}
                      onChange={(e) => handleChange("type", e.target.value)}
                      onBlur={() => handleBlur("type")}
                      isDisabled={disableForm}
                    >
                      {COMPANY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type.replaceAll("_", " ")}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.type}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Country</FormLabel>
                    <Input
                      value={form.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      placeholder="Country"
                      isDisabled={disableForm}
                    />
                  </FormControl>
                </Grid>

                <Stack spacing={3}>
                  <Text fontWeight="600">Registered Address</Text>

                  <FormControl>
                    <FormLabel>Address Line 1</FormLabel>
                    <Textarea
                      value={form.addressLine1}
                      onChange={(e) => handleChange("addressLine1", e.target.value)}
                      placeholder="Enter address line 1"
                      rows={2}
                      isDisabled={disableForm}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Address Line 2</FormLabel>
                    <Input
                      value={form.addressLine2}
                      onChange={(e) => handleChange("addressLine2", e.target.value)}
                      placeholder="Enter address line 2"
                      isDisabled={disableForm}
                    />
                  </FormControl>

                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
                    <FormControl>
                      <FormLabel>City</FormLabel>
                      <Input
                        value={form.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="City"
                        isDisabled={disableForm}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>State</FormLabel>
                      <Input
                        value={form.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                        placeholder="State"
                        isDisabled={disableForm}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Pincode</FormLabel>
                      <Input
                        value={form.pincode}
                        onChange={(e) => handleChange("pincode", e.target.value)}
                        placeholder="Pincode"
                        isDisabled={disableForm}
                      />
                    </FormControl>
                  </Grid>
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
            {editing ? "Save Changes" : "Create Company"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}