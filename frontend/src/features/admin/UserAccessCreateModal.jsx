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
  Text,
  VStack,
} from "@chakra-ui/react";
import UserAsyncSelect from "./UserAsyncSelect";
import CompanyAsyncSelect from "./CompanyAsyncSelect";

const ROLE_OPTIONS = ["ADMIN", "ACCOUNTANT", "VIEWER"];

const initialForm = {
  userId: "",
  userLabel: "",
  companyId: "",
  companyLabel: "",
  tenantId: "",
  role: "VIEWER",
};

export default function UserAccessCreateModal({
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

  const handleUserChange = (userId, user) => {
    setForm((prev) => ({
      ...prev,
      userId: userId || "",
      userLabel:
        user?.username ||
        user?.email ||
        (userId ? `User #${userId}` : ""),
    }));
  };

  const handleCompanyChange = (companyId, company) => {
    setForm((prev) => ({
      ...prev,
      companyId: companyId || "",
      companyLabel:
        company?.name ||
        company?.legalName ||
        (companyId ? `Company #${companyId}` : ""),
      tenantId: company?.tenantId ?? "",
    }));
  };

  const validate = () => {
    const next = {};

    if (!String(form.userId).trim()) {
      next.userId = "User is required";
    }

    if (!String(form.companyId).trim()) {
      next.companyId = "Company is required";
    }

    if (!String(form.tenantId).trim()) {
      next.tenantId = "Tenant could not be resolved from selected company";
    }

    if (!form.role) {
      next.role = "Role is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onCreate({
      userId: Number(form.userId),
      companyId: Number(form.companyId),
      tenantId: Number(form.tenantId),
      role: form.role,
    });
  };

  const selectedSummary = useMemo(() => {
    if (!form.userId && !form.companyId) return null;

    return {
      user: form.userLabel || (form.userId ? `#${form.userId}` : "—"),
      company: form.companyLabel || (form.companyId ? `#${form.companyId}` : "—"),
      tenant: form.tenantId || "—",
    };
  }, [
    form.userId,
    form.userLabel,
    form.companyId,
    form.companyLabel,
    form.tenantId,
  ]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Grant User Access</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.500">
              Select a user and company. Tenant ID is automatically derived from
              the selected company.
            </Text>

            <FormControl isInvalid={!!errors.userId} isRequired>
              <UserAsyncSelect
                value={form.userId}
                onChange={handleUserChange}
                error={errors.userId}
                isRequired
                label="User"
              />
              <FormErrorMessage>{errors.userId}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.companyId} isRequired>
              <CompanyAsyncSelect
                value={form.companyId}
                onChange={handleCompanyChange}
                error={errors.companyId}
                isRequired
                label="Company"
              />
              <FormErrorMessage>{errors.companyId}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.tenantId} isRequired>
              <FormLabel>Tenant ID</FormLabel>
              <Input
                value={form.tenantId}
                isReadOnly
                placeholder="Auto-filled from company"
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

            {selectedSummary && (
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
                    User:
                  </Text>{" "}
                  {selectedSummary.user}
                </Text>
                <Text fontSize="sm">
                  <Text as="span" fontWeight="600">
                    Company:
                  </Text>{" "}
                  {selectedSummary.company}
                </Text>
                <Text fontSize="sm">
                  <Text as="span" fontWeight="600">
                    Tenant ID:
                  </Text>{" "}
                  {selectedSummary.tenant}
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
              Grant Access
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}