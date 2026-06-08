import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "./tenantUserApi";

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  const toast = useToast();

  const [showCurrent, setShowCurrent] = useState(false);

  const [showNew, setShowNew] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validate = () => {
    if (!form.currentPassword) {
      toast({
        title: "Current password required",
        status: "warning",
      });

      return false;
    }

    if (!form.newPassword) {
      toast({
        title: "New password required",
        status: "warning",
      });

      return false;
    }

    if (form.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Minimum 8 characters required",
        status: "warning",
      });

      return false;
    }

    if (!form.confirmPassword) {
      toast({
        title: "Confirm password required",
        status: "warning",
      });

      return false;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast({
        title: "Passwords do not match",
        status: "error",
      });

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      await changePassword(form);

      toast({
        title: "Password changed",
        description: "You can continue using the application.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      navigate("/");
    } catch (error) {
      toast({
        title: "Password change failed",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Unexpected error",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxW="lg" py={16}>
      <Card shadow="lg" borderRadius="xl">
        <CardHeader>
          <VStack spacing={3}>
            <Icon as={Lock} boxSize={10} />

            <Heading size="lg">Change Password</Heading>

            <Text color="gray.500" textAlign="center">
              Your account requires a password change before continuing.
            </Text>
          </VStack>
        </CardHeader>

        <CardBody>
          <VStack spacing={5}>
            <FormControl isRequired>
              <FormLabel>Current Password</FormLabel>

              <InputGroup>
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={form.currentPassword}
                  onChange={(e) =>
                    updateField("currentPassword", e.target.value)
                  }
                />

                <InputRightElement>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCurrent(!showCurrent)}
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>New Password</FormLabel>

              <InputGroup>
                <Input
                  type={showNew ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) => updateField("newPassword", e.target.value)}
                />

                <InputRightElement>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Confirm Password</FormLabel>

              <InputGroup>
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    updateField("confirmPassword", e.target.value)
                  }
                />

                <InputRightElement>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Box width="100%" pt={2}>
              <Button
                colorScheme="blue"
                width="100%"
                isLoading={saving}
                loadingText="Changing Password"
                onClick={handleSubmit}
              >
                Change Password
              </Button>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}
