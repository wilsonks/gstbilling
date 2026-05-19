import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PlatformRoute({ children }) {
  const { scope } = useSelector((s) => s.auth);

  if (scope !== "PLATFORM") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}