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
} from "@chakra-ui/react";

export default function TenantEditModal({
  isOpen,
  onClose,
  tenant,
  onSave,
  isSubmitting = false,
}) {
  const [form, setForm] = useState({
    name: "",
    gstin: "",
    contactEmail: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && tenant) {
      setForm({
        name: tenant.name || "",
        gstin: tenant.gstin || "",
        contactEmail: tenant.contactEmail || "",
      });
      setErrors({});
    }
  }, [isOpen, tenant]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next = {};

    if (!form.name.trim()) {
      next.name = "Tenant name is required";
    }

    if (!form.gstin.trim()) {
      next.gstin = "GSTIN is required";
    } else if (form.gstin.trim().length !== 15) {
      next.gstin = "GSTIN must be 15 characters";
    }

    if (!form.contactEmail.trim()) {
      next.contactEmail = "Contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) {
      next.contactEmail = "Enter a valid email address";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSave({
      name: form.name.trim(),
      gstin: form.gstin.trim().toUpperCase(),
      contactEmail: form.contactEmail.trim().toLowerCase(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Tenant</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel>Tenant Name</FormLabel>
              <Input
                placeholder="Enter tenant name"
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

            <FormControl isInvalid={!!errors.contactEmail} isRequired>
              <FormLabel>Contact Email</FormLabel>
              <Input
                placeholder="Enter contact email"
                type="email"
                value={form.contactEmail}
                onChange={(e) => setField("contactEmail", e.target.value)}
              />
              <FormErrorMessage>{errors.contactEmail}</FormErrorMessage>
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
