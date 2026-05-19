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
  Switch,
  Select,
} from "@chakra-ui/react";
import TenantAsyncSelect from "./TenantAsyncSelect";

const initialForm = {
  name: "",
  gstin: "",
  email: "",
  address: "",
  phone: "",
  type: "",
  tenantId: "",
  active: true,
};

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

export default function CompanyCreateModal({
  isOpen,
  onClose,
  onCreate,
  isSubmitting = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm);
      setErrors({});
    }
  }, [isOpen]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next = {};

    if (!form.name.trim()) {
      next.name = "Company name is required";
    }

    if (!form.gstin.trim()) {
      next.gstin = "GSTIN is required";
    } else if (form.gstin.trim().length !== 15) {
      next.gstin = "GSTIN must be 15 characters";
    }

    if (!form.type) {
      next.type = "Company type is required";
    }

    if (!String(form.tenantId).trim()) {
      next.tenantId = "Tenant is required";
    }

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

    await onCreate({
      name: form.name.trim(),
      gstin: form.gstin.trim().toUpperCase(),
      email: form.email.trim().toLowerCase(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      type: form.type,
      tenantId: Number(form.tenantId),
      active: form.active,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Company</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel>Company Name</FormLabel>
              <Input
                placeholder="Enter company name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.gstin} isRequired>
              <FormLabel>GSTIN</FormLabel>
              <Input
                placeholder="Enter GSTIN"
                value={form.gstin}
                onChange={(e) =>
                  setField("gstin", e.target.value.toUpperCase())
                }
                maxLength={15}
              />
              <FormErrorMessage>{errors.gstin}</FormErrorMessage>
            </FormControl>

            <TenantAsyncSelect
              label="Tenant"
              value={form.tenantId}
              onChange={(tenantId) => setField("tenantId", tenantId)}
              isRequired
              error={errors.tenantId}
            />

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

            <FormControl>
              <FormLabel>Address</FormLabel>
              <Input
                placeholder="Enter address"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
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
              Create Company
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
