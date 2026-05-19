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
  Switch,
  FormErrorMessage,
  HStack,
} from "@chakra-ui/react";

const initialForm = {
  name: "",
  gstin: "",
  contactEmail: "",
  active: true,
};

export default function TenantCreateModal({
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

    await onCreate({
      name: form.name.trim(),
      gstin: form.gstin.trim().toUpperCase(),
      contactEmail: form.contactEmail.trim().toLowerCase(),
      active: form.active,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Tenant</ModalHeader>
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
                onChange={(e) => setField("gstin", e.target.value.toUpperCase())}
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
              Create Tenant
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}