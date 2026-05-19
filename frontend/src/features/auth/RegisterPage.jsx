import React, { useState } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Spinner,
  useToast,
  HStack,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import api from "../../services/api";
import { useDispatch } from "react-redux";
import { setAuth } from "./authSlice";
import { setSelected, setCompanyList } from "../company/companySlice";
import { useNavigate } from "react-router-dom";
import { decodeJwt } from "../../utils/jwt";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    email: "",
    password: "",
    companyName: "",
    gstin: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Valid email is required";
    if (!form.password || form.password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!form.companyName) return "Company name is required";
    if (!form.gstin || form.gstin.length !== 15) {
      return "GSTIN must be 15 characters";
    }
    return null;
  };

  const handleRegister = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/api/auth/register", form);
      const token = res.data.accessToken;
      const decoded = token ? decodeJwt(token) : {};

      const scope = decoded.scope ?? "TENANT";
      const role =
        res.data.role ?? decoded.role ?? decoded.platformRole ?? null;

      dispatch(
        setAuth({
          accessToken: res.data.accessToken || null,
          refreshToken: res.data.refreshToken || null,
          username: res.data.username || null,
          companyId: res.data.companyId || null,
          role,
          scope,
        }),
      );

      dispatch(setCompanyList({ companies: res.data.companies || [] }));
      dispatch(setSelected({ companyId: res.data.companyId || null }));

      toast({
        title: "Account created",
        description: "Registration successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate(scope === "PLATFORM" ? "/admin" : "/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      toast({
        title: "Registration failed",
        description: message,
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleRegister();
  };

  const demoFill1 = () => {
    setError("");
    setForm({
      email: "demo1@company.com",
      password: "demo1@1234",
      companyName: "Demo1 Pvt Ltd",
      gstin: "29ABCDE1234F1Z5",
    });
  };

  const demoFill2 = () => {
    setError("");
    setForm({
      email: "demo2@company.com",
      password: "demo2@1234",
      companyName: "Demo2 Pvt Ltd",
      gstin: "29ABCDE1234F1Z6",
    });
  };

  return (
    <Box
      minH="100dvh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={6}
    >
      <Box
        as="form"
        onSubmit={onSubmit}
        w="100%"
        maxW="360px"
        p={{ base: 5, md: 8 }}
        borderRadius="lg"
        boxShadow="lg"
        bg="white"
      >
        <VStack spacing={4}>
          <Heading size="lg">Create Account</Heading>

          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={handleChange}
                pr="3rem"
              />
              <InputRightElement>
                <IconButton
                  variant="ghost"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowPassword((prev) => !prev)}
                  size="sm"
                  type="button"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <FormControl>
            <FormLabel>Company Name</FormLabel>
            <Input
              name="companyName"
              placeholder="ABC Pvt Ltd"
              value={form.companyName}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isInvalid={!!error}>
            <FormLabel>GSTIN</FormLabel>
            <Input
              name="gstin"
              placeholder="29ABCDE1234F1Z5"
              value={form.gstin}
              onChange={handleChange}
            />
            <FormErrorMessage>{error}</FormErrorMessage>
          </FormControl>

          <HStack width="full">
            <Button
              colorScheme="blue"
              width="full"
              type="submit"
              isDisabled={loading}
            >
              {loading ? <Spinner size="sm" /> : "Register"}
            </Button>
          </HStack>
          <HStack width="full">
            <Button
              variant="outline"
              width="full"
              onClick={demoFill1}
              isDisabled={loading}
              type="button"
            >
              Demo 1
            </Button>
            <Button
              variant="outline"
              width="full"
              onClick={demoFill2}
              isDisabled={loading}
              type="button"
            >
              Demo 2
            </Button>
          </HStack>

          <Text fontSize="sm">
            Already have an account?{" "}
            <Text
              as="span"
              color="blue.500"
              cursor="pointer"
              onClick={() => navigate("/")}
            >
              Login
            </Text>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
