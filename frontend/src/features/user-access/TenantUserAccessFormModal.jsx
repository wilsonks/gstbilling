import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
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
  createTenantUserAccess,
  updateTenantUserAccess,
} from "./tenantUserAccessApi";
import UserSelect from "../../components/async/UserSelect";
import CompanySelect from "../../components/async/CompanySelect";

const ROLE_OPTIONS = ["ADMIN", "MANAGER", "STAFF"];

export default function TenantUserAccessFormModal({
  isOpen,
  onClose,
  onSuccess,
  accessRecord = null,
}) {
  const toast = useToast();

  const [form, setForm] = useState({
    userId: "",
    companyId: "",
    role: "STAFF",
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [touched, setTouched] = useState({});

  const editing = !!accessRecord?.id;

  useEffect(() => {
    if (!isOpen) return;

    setLoadingForm(true);

    if (accessRecord) {
      setForm({
        userId: accessRecord.userId ?? "",
        companyId: accessRecord.companyId ?? "",
        role: accessRecord.role ?? "STAFF",
        active: accessRecord.active ?? true,
      });
    } else {
      setForm({
        userId: "",
        companyId: "",
        role: "STAFF",
        active: true,
      });
    }

    setTouched({});
    setLoadingForm(false);
  }, [isOpen, accessRecord]);

  const errors = useMemo(() => {
    const next = {};

    if (!String(form.userId).trim()) next.userId = "User is required";
    if (!String(form.companyId).trim()) next.companyId = "Company is required";
    if (!String(form.role).trim()) next.role = "Role is required";

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

  const handleSubmit = async () => {
    setTouched({
      userId: true,
      companyId: true,
      role: true,
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
        await updateTenantUserAccess(accessRecord.id, {
          role: form.role,
          active: !!form.active,
        });
      } else {
        await createTenantUserAccess({
          userId: Number(form.userId),
          companyId: Number(form.companyId),
          role: form.role,
          active: !!form.active,
        });
      }

      toast({
        title: editing ? "User access updated" : "User access created",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast({
        title: editing
          ? "Failed to update user access"
          : "Failed to create user access",
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader>
          {editing ? "Edit User Access" : "Create User Access"}
        </ModalHeader>
        <ModalCloseButton isDisabled={saving} />

        <ModalBody>
          <Stack spacing={5}>
            <Text color="gray.500" fontSize="sm">
              Assign tenant users to companies and control company-level roles.
            </Text>

            {loadingForm ? (
              <Stack spacing={4}>
                <Skeleton height="40px" />
                <Skeleton height="40px" />
                <Skeleton height="40px" />
              </Stack>
            ) : (
              <>
                <FormControl isRequired isInvalid={touched.userId && !!errors.userId}>
                  <FormLabel>User</FormLabel>
                  <UserSelect
                    value={form.userId}
                    onChange={(value) => handleChange("userId", value)}
                    isDisabled={disableForm || editing}
                  />
                  <FormErrorMessage>{errors.userId}</FormErrorMessage>
                </FormControl>

                <FormControl
                  isRequired
                  isInvalid={touched.companyId && !!errors.companyId}
                >
                  <FormLabel>Company</FormLabel>
                  <CompanySelect
                    value={form.companyId}
                    onChange={(value) => handleChange("companyId", value)}
                    isDisabled={disableForm || editing}
                  />
                  <FormErrorMessage>{errors.companyId}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={touched.role && !!errors.role}>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={form.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    onBlur={() => handleBlur("role")}
                    isDisabled={disableForm}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.role}</FormErrorMessage>
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
            {editing ? "Save Changes" : "Create Access"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}