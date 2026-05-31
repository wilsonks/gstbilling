import React, { useState } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  Heading,
  HStack,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import api from "../../services/api";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { setAuth } from "./authSlice";
import { setSelected, setCompanyList } from "../company/companySlice";
import { decodeJwt } from "../../utils/jwt";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (payload) => {
    try {
      setLoading(true);

      const res = await api.post("/api/auth/login", payload);
      const token = res.data.accessToken;
      const decoded = decodeJwt(token);

      const scope = decoded.scope ?? null;
      const role =
        res.data.role ?? decoded.role ?? decoded.platformRole ?? null;

      if (!scope) {
        toast({
          title: "Authentication error",
          description: "Scope missing in token.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      dispatch(
        setAuth({
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
          username: res.data.username,
          companyId: res.data.companyId,
          role,
          scope,
        }),
      );

      if (scope === "TENANT") {
        dispatch(setCompanyList({ companies: res.data.companies || [] }));
        dispatch(setSelected({ companyId: res.data.companyId || null }));
        navigate("/dashboard");
      } else if (scope === "PLATFORM") {
        dispatch(setCompanyList({ companies: [] }));
        dispatch(setSelected({ companyId: null }));
        navigate("/admin");
      } else {
        toast({
          title: "Authentication error",
          description: "Unsupported user scope.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: "Login failed",
        description: err.response?.data?.message || "Login failed",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const login = (e) => {
    e.preventDefault();
    handleLogin({ email, password });
  };

  const demoTenantLogin = () => {
    setEmail("tenant1_admin@local.com");
    setPassword("admin@1234");
  };

  const demoPlatformLogin = () => {
    setEmail("root@local.com");
    setPassword("root@1234");
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
        onSubmit={login}
        w="100%"
        maxW="360px"
        p={{ base: 5, md: 8 }}
        boxShadow="lg"
        borderRadius="lg"
        bg="white"
      >
        <VStack spacing={4}>
          <Heading size="lg">Login</Heading>

          <Input
            placeholder="Email / Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputGroup>
            <Input
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <HStack width="100%">
            <Button
              colorScheme="blue"
              width="100%"
              type="submit"
              isLoading={loading}
            >
              Login
            </Button>
          </HStack>

          <HStack width="100%">
            <Button
              variant="outline"
              width="100%"
              onClick={demoTenantLogin}
              isDisabled={loading}
              type="button"
            >
              Demo Tenant
            </Button>
            <Button
              variant="outline"
              width="100%"
              onClick={demoPlatformLogin}
              isDisabled={loading}
              type="button"
            >
              Demo Root
            </Button>
          </HStack>

          <Text fontSize="sm">
            New user?{" "}
            <Text
              as="span"
              color="blue.500"
              cursor="pointer"
              onClick={() => navigate("/register")}
            >
              Register
            </Text>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
