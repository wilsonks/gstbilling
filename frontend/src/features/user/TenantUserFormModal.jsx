import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  CheckboxGroup,
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
  Skeleton,
  Stack,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import { createTenantUser, updateTenantUser } from "./tenantUserApi";

const ROLE_OPTIONS = ["ADMIN", "MANAGER", "STAFF"];

const initialForm = {
  username: "",
  email: "",
  password: "",
  roles: ["STAFF"],
  active: true,
};

export default function TenantUserFormModal({
  isOpen,
  onClose,
  onSuccess,
  user = null,
}) {
  const toast = useToast();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [touched, setTouched] = useState({});

  const editing = !!user?.id;

  useEffect(() => {
    if (!isOpen) return;

    setLoadingForm(true);

    if (user) {
      setForm({
        username: user.username ?? "",
        email: user.email ?? "",
        password: "",
        roles: user.roles?.length ? user.roles : ["STAFF"],
        active: user.active ?? true,
      });
    } else {
      setForm(initialForm);
    }

    setTouched({});
    setLoadingForm(false);
  }, [isOpen, user]);

  const errors = useMemo(() => {
    const next = {};

    if (!editing) {
      if (!String(form.username).trim()) next.username = "Username is required";
      if (!String(form.password).trim()) next.password = "Password is required";
    }

    if (!String(form.email).trim()) {
      next.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.email).trim())
    ) {
      next.email = "Enter a valid email address";
    }

    if (!form.roles || form.roles.length === 0) {
      next.roles = "At least one role is required";
    }

    return next;
  }, [form, editing]);

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

  const buildCreatePayload = () => ({
    username: String(form.username || "").trim(),
    email: String(form.email || "").trim().toLowerCase(),
    password: String(form.password || ""),
    roles: form.roles,
    active: !!form.active,
  });

  const buildUpdatePayload = () => ({
    email: String(form.email || "").trim().toLowerCase(),
    roles: form.roles,
    active: !!form.active,
  });

  const handleSubmit = async () => {
    setTouched({
      username: true,
      email: true,
      password: true,
      roles: true,
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
      if (editing) {
        await updateTenantUser(user.id, buildUpdatePayload());
      } else {
        await createTenantUser(buildCreatePayload());
      }

      toast({
        title: editing ? "User updated" : "User created",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast({
        title: editing ? "Failed to update user" : "Failed to create user",
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
        <ModalHeader>{editing ? "Edit Tenant User" : "Create Tenant User"}</ModalHeader>
        <ModalCloseButton isDisabled={saving} />

        <ModalBody>
          <Stack spacing={5}>
            <Text color="gray.500" fontSize="sm">
              Manage tenant users and assign application roles.
            </Text>

            {loadingForm ? (
              <Stack spacing={4}>
                <Skeleton height="40px" />
                <Skeleton height="40px" />
                <Skeleton height="40px" />
                <Skeleton height="80px" />
              </Stack>
            ) : (
              <>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormControl
                    isRequired={!editing}
                    isInvalid={touched.username && !!errors.username}
                  >
                    <FormLabel>Username</FormLabel>
                    <Input
                      value={form.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      onBlur={() => handleBlur("username")}
                      placeholder="Enter username"
                      isDisabled={disableForm || editing}
                    />
                    <FormErrorMessage>{errors.username}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={touched.email && !!errors.email}>
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
                </Grid>

                {!editing && (
                  <FormControl isRequired isInvalid={touched.password && !!errors.password}>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                      placeholder="Enter password"
                      isDisabled={disableForm}
                    />
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                  </FormControl>
                )}

                <FormControl isRequired isInvalid={touched.roles && !!errors.roles}>
                  <FormLabel>Roles</FormLabel>
                  <CheckboxGroup
                    value={form.roles}
                    onChange={(value) => handleChange("roles", value)}
                  >
                    <Stack spacing={3}>
                      {ROLE_OPTIONS.map((role) => (
                        <Checkbox key={role} value={role} isDisabled={disableForm}>
                          {role}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                  <FormErrorMessage>{errors.roles}</FormErrorMessage>
                </FormControl>

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
            {editing ? "Save Changes" : "Create User"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}