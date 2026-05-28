import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  HStack,
  Select,
  Switch,
  Grid,
} from "@chakra-ui/react";
import TenantAsyncSelect from "./TenantAsyncSelect";

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

export default function CompanyEditModal({
  isOpen,
  onClose,
  company,
  onSave,
  isSubmitting = false,
}) {
  const [form, setForm] = useState({
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
    type: "",
    tenantId: "",
    active: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && company) {
      setForm({
        name: company.name || "",
        legalName: company.legalName || "",
        tradeName: company.tradeName || "",
        gstin: company.gstin || "",
        email: company.email || "",
        phone: company.phone || "",
        addressLine1: company.addressLine1 || "",
        addressLine2: company.addressLine2 || "",
        city: company.city || "",
        state: company.state || "",
        pincode: company.pincode || "",
        country: company.country || "India",
        type: company.type || "",
        tenantId: company.tenantId ?? "",
        active: company.active ?? true,
      });
      setErrors({});
    }
  }, [isOpen, company]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next = {};

    if (!form.name.trim()) next.name = "Company name is required";

    if (!form.gstin.trim()) {
      next.gstin = "GSTIN is required";
    } else if (form.gstin.trim().length !== 15) {
      next.gstin = "GSTIN must be 15 characters";
    }

    if (!form.type) next.type = "Company type is required";
    if (!String(form.tenantId).trim()) next.tenantId = "Tenant is required";

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      next.email = "Enter a valid email address";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSave({
      name: form.name.trim(),
      legalName: form.legalName.trim(),
      tradeName: form.tradeName.trim(),
      gstin: form.gstin.trim().toUpperCase(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      country: form.country.trim() || "India",
      type: form.type,
      tenantId: Number(form.tenantId),
      active: form.active,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Company</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel>Company Name</FormLabel>
                <Input
                  placeholder="Enter company name"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Legal Name</FormLabel>
                <Input
                  placeholder="Enter legal name"
                  value={form.legalName}
                  onChange={(e) => setField("legalName", e.target.value)}
                />
              </FormControl>
            </Grid>

            <FormControl>
              <FormLabel>Trade Name</FormLabel>
              <Input
                placeholder="Enter trade name"
                value={form.tradeName}
                onChange={(e) => setField("tradeName", e.target.value)}
              />
            </FormControl>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <FormControl isInvalid={!!errors.gstin} isRequired>
                <FormLabel>GSTIN</FormLabel>
                <Input
                  placeholder="Enter GSTIN"
                  value={form.gstin}
                  onChange={(e) => setField("gstin", e.target.value.toUpperCase())}
                  maxLength={15}
                />
                <FormErrorMessage>{errors.gstin}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.type} isRequired>
                <FormLabel>Company Type</FormLabel>
                <Select
                  placeholder="Select company type"
                  value={form.type}
                  onChange={(e) => setField("type", e.target.value)}
                >
                  {COMPANY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replaceAll("_", " ")}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.type}</FormErrorMessage>
              </FormControl>
            </Grid>

            <TenantAsyncSelect
              label="Tenant"
              value={form.tenantId}
              onChange={(tenantId) => setField("tenantId", tenantId)}
              isRequired
              error={errors.tenantId}
            />

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  placeholder="Enter email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input
                  placeholder="Enter phone"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                />
              </FormControl>
            </Grid>

            <FormControl>
              <FormLabel>Address Line 1</FormLabel>
              <Input
                placeholder="Enter address line 1"
                value={form.addressLine1}
                onChange={(e) => setField("addressLine1", e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Address Line 2</FormLabel>
              <Input
                placeholder="Enter address line 2"
                value={form.addressLine2}
                onChange={(e) => setField("addressLine2", e.target.value)}
              />
            </FormControl>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
              <FormControl>
                <FormLabel>City</FormLabel>
                <Input
                  placeholder="Enter city"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>State</FormLabel>
                <Input
                  placeholder="Enter state"
                  value={form.state}
                  onChange={(e) => setField("state", e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Pincode</FormLabel>
                <Input
                  placeholder="Enter pincode"
                  value={form.pincode}
                  onChange={(e) => setField("pincode", e.target.value)}
                />
              </FormControl>
            </Grid>

            <FormControl>
              <FormLabel>Country</FormLabel>
              <Input
                placeholder="Enter country"
                value={form.country}
                onChange={(e) => setField("country", e.target.value)}
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Active</FormLabel>
              <Switch
                isChecked={form.active}
                onChange={(e) => setField("active", e.target.checked)}
                colorScheme="green"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Save Changes
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}