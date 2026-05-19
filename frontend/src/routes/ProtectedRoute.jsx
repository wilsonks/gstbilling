import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
  const token = useSelector((s) => s.auth.accessToken);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}