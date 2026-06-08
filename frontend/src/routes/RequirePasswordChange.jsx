import React, { useEffect, useState } from "react";

import { Navigate, useLocation } from "react-router-dom";

import { Center, Spinner } from "@chakra-ui/react";

import { getCurrentUser } from "../features/user/tenantUserApi";

export default function RequirePasswordChange({ children }) {
  const location = useLocation();

  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await getCurrentUser();

      setUser(response);
    } catch (error) {
      console.error("Failed loading current user", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (user?.forcePasswordChange && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  if (!user?.forcePasswordChange && location.pathname === "/change-password") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
