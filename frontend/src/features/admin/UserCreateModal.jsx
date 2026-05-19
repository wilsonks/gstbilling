import React, { useEffect, useState } from "react";
import {
  Checkbox,
  CheckboxGroup,
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
  Button,
  VStack,
} from "@chakra-ui/react";
import TenantAsyncSelect from "./TenantAsyncSelect";

const TENANT_ROLES = ["ADMIN", "ACCOUNTANT", "VIEWER"];
const PLATFORM_ROLES = ["SUPER_ADMIN", "ADMIN"];

const initialForm = {
  username: "",
  email: "",
  password: "",
  scope: "TENANT",
  tenantId: "",
  roles: [],
};

export default function UserCreateModal({
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
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "scope") {
        next.roles = [];
        if (value === "PLATFORM") {
          next.tenantId = "";
        }
      }

      return next;
    });
  };

  const availableRoles =
    form.scope === "PLATFORM" ? PLATFORM_ROLES : TENANT_ROLES;

  const validate = () => {
    const next = {};

    if (!form.username.trim() && !form.email.trim()) {
      next.username = "Username or email is required";
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      next.email = "Enter a valid email address";
    }

    if (!form.password.trim()) {
      next.password = "Password is required";
    } else if (form.password.trim().length < 8) {
      next.password = "Password must be at least 8 characters";
    }

    if (!form.scope) {
      next.scope = "Scope is required";
    }

    if (form.scope === "TENANT" && !String(form.tenantId).trim()) {
      next.tenantId = "Tenant is required for tenant users";
    }

    if (!form.roles.length) {
      next.roles = "Select at least one role";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onCreate({
      username: form.username.trim() || null,
      email: form.email.trim() || null,
      password: form.password,
      scope: form.scope,
      tenantId: form.scope === "PLATFORM" ? null : Number(form.tenantId),
      roles: form.roles,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create User</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.username}>
              <FormLabel>Username</FormLabel>
              <Input
                placeholder="Enter username or leave blank to derive from email"
                value={form.username}
                onChange={(e) => setField("username", e.target.value)}
              />
              <FormErrorMessage>{errors.username}</FormErrorMessage>
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

            <FormControl isInvalid={!!errors.password} isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                placeholder="Enter password"
                type="password"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.scope} isRequired>
              <FormLabel>Scope</FormLabel>
              <Select
                value={form.scope}
                onChange={(e) => setField("scope", e.target.value)}
              >
                <option value="TENANT">TENANT</option>
                <option value="PLATFORM">PLATFORM</option>
              </Select>
              <FormErrorMessage>{errors.scope}</FormErrorMessage>
            </FormControl>

            {form.scope === "TENANT" && (
              <TenantAsyncSelect
                label="Tenant"
                value={form.tenantId}
                onChange={(tenantId) => setField("tenantId", tenantId)}
                isRequired
                error={errors.tenantId}
              />
            )}

            <FormControl isInvalid={!!errors.roles} isRequired>
              <FormLabel>Roles</FormLabel>
              <CheckboxGroup
                value={form.roles}
                onChange={(values) => setField("roles", values)}
              >
                <VStack align="stretch">
                  {availableRoles.map((role) => (
                    <Checkbox key={role} value={role}>
                      {role.replaceAll("_", " ")}
                    </Checkbox>
                  ))}
                </VStack>
              </CheckboxGroup>
              <FormErrorMessage>{errors.roles}</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Create User
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
