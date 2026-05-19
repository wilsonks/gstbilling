import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react";

const ROLE_OPTIONS = ["ADMIN", "ACCOUNTANT", "VIEWER"];

export default function UserAccessEditModal({
  isOpen,
  onClose,
  access,
  onSave,
  isSubmitting = false,
}) {
  const [form, setForm] = useState({
    tenantId: "",
    role: "VIEWER",
    active: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && access) {
      setForm({
        tenantId: access.tenantId ?? "",
        role: access.role || "VIEWER",
        active: !!access.active,
      });
      setErrors({});
    }
  }, [isOpen, access]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next = {};

    if (!String(form.tenantId).trim()) {
      next.tenantId = "Tenant ID is required";
    } else if (Number.isNaN(Number(form.tenantId))) {
      next.tenantId = "Tenant ID must be numeric";
    }

    if (!form.role) {
      next.role = "Role is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSave({
      tenantId: Number(form.tenantId),
      role: form.role,
      active: !!form.active,
    });
  };

  const summary = useMemo(() => {
    if (!access) return null;

    return {
      user: access.userId ?? "—",
      company: access.companyId ?? "—",
      tenant: form.tenantId || "—",
      role: form.role || "—",
      status: form.active ? "ACTIVE" : "INACTIVE",
    };
  }, [access, form.tenantId, form.role, form.active]);

  if (!access) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit User Access</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.500">
              Update tenant assignment, role, or active status. User and company
              cannot be changed here.
            </Text>

            <FormControl>
              <FormLabel>User ID</FormLabel>
              <Input value={access.userId} isReadOnly />
            </FormControl>

            <FormControl>
              <FormLabel>Company ID</FormLabel>
              <Input value={access.companyId} isReadOnly />
            </FormControl>

            <FormControl isInvalid={!!errors.tenantId} isRequired>
              <FormLabel>Tenant ID</FormLabel>
              <Input
                placeholder="Enter tenant ID"
                value={form.tenantId}
                onChange={(e) => setField("tenantId", e.target.value)}
              />
              <FormErrorMessage>{errors.tenantId}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.role} isRequired>
              <FormLabel>Role</FormLabel>
              <Select
                value={form.role}
                onChange={(e) => setField("role", e.target.value)}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role.replaceAll("_", " ")}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.role}</FormErrorMessage>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Active</FormLabel>
              <Switch
                isChecked={form.active}
                onChange={(e) => setField("active", e.target.checked)}
                colorScheme="green"
              />
            </FormControl>

            {summary && (
              <VStack
                align="stretch"
                spacing={1}
                p={3}
                borderWidth="1px"
                borderRadius="md"
                bg="gray.50"
              >
                <Text fontSize="sm">
                  <Text as="span" fontWeight="600">
                    User ID:
                  </Text>{" "}
                  {summary.user}
                </Text>
                <Text fontSize="sm">
                  <Text as="span" fontWeight="600">
                    Company ID:
                  </Text>{" "}
                  {summary.company}
                </Text>
                <Text fontSize="sm">
                  <Text as="span" fontWeight="600">
                    Tenant ID:
                  </Text>{" "}
                  {summary.tenant}
                </Text>
                <Text fontSize="sm">
                  <Text as="span" fontWeight="600">
                    Role:
                  </Text>{" "}
                  {summary.role}
                </Text>
                <Text fontSize="sm">
                  <Text as="span" fontWeight="600">
                    Status:
                  </Text>{" "}
                  {summary.status}
                </Text>
              </VStack>
            )}
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