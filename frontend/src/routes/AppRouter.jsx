import React from "react";

import { Routes, Route, Navigate } from "react-router-dom";

import { useSelector } from "react-redux";

/* =========================================================
 * Layouts
 * =======================================================*/

import AppLayout from "../layout/AppLayout";
import AdminLayout from "../layout/AdminLayout";

/* =========================================================
 * Route Guards
 * =======================================================*/

import ProtectedRoute from "./ProtectedRoute";
import PlatformRoute from "./PlatformRoute";

/* =========================================================
 * Auth
 * =======================================================*/

import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";

/* =========================================================
 * Tenant Pages
 * =======================================================*/

import Dashboard from "../pages/Dashboard";
import ProductPage from "../features/product/ProductPage";
import PartiesPage from "../pages/PartiesPage";
import InvoicePage from "../pages/InvoicePage";
import InvoiceCreatePage from "../pages/InvoiceCreatePage";

/* =========================================================
 * Admin Pages
 * =======================================================*/

import DashboardPage from "../features/admin/DashboardPage";
import TenantPage from "../features/admin/TenantPage";
import TenantDetailsPage from "../features/admin/TenantDetailsPage";
import CompanyPage from "../features/admin/CompanyPage";
import CompanyDetailsPage from "../features/admin/CompanyDetailsPage";
import UserPage from "../features/admin/UserPage";
import UserDetailsPage from "../features/admin/UserDetailsPage";
import UserAccessPage from "../features/admin/UserAccessPage";
import UserAccessDetailsPage from "../features/admin/UserAccessDetailsPage";
import AuditLogsPage from "../features/admin/AuditLogsPage";
import AuditLogDetailsModal from "../features/admin/AuditLogDetailsModal";
import AdminMetricsPage from "../features/admin/AdminMetricsPage";
import MetricsPage from "../features/admin/MetricsPage";
import BillingPage from "../features/admin/BillingPage";

/* =========================================================
 * Router
 * =======================================================*/

export default function AppRouter() {
  const { accessToken, scope } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* =====================================================
       * Public Route
       * ===================================================*/}
      <Route
        path="/"
        element={
          accessToken ? (
            scope === "PLATFORM" ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <LoginPage />
          )
        }
      />
      <Route path="/register" element={<RegisterPage />} />

      {/* =====================================================
       * Tenant Routes
       * ===================================================*/}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProductPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parties"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PartiesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoice"
        element={
          <ProtectedRoute>
            <AppLayout>
              <InvoicePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoice/new"
        element={
          <ProtectedRoute>
            <AppLayout>
              <InvoiceCreatePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      {/* =====================================================
       * Platform Admin Routes
       * ===================================================*/}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <PlatformRoute>
              <AdminLayout>
                <DashboardPage />
              </AdminLayout>
            </PlatformRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tenants"
        element={
          <ProtectedRoute>
            <PlatformRoute>
              <AdminLayout>
                <TenantPage />
              </AdminLayout>
            </PlatformRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/tenants/:id"
        element={
          <ProtectedRoute>
            <PlatformRoute>
              <AdminLayout>
                <TenantDetailsPage />
              </AdminLayout>
            </PlatformRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/companies"
        element={
          <ProtectedRoute>
            <PlatformRoute>
              <AdminLayout>
                <CompanyPage />
              </AdminLayout>
            </PlatformRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/companies/:id"
        element={
          <ProtectedRoute>
            <PlatformRoute>
              <AdminLayout>
                <CompanyDetailsPage />
              </AdminLayout>
            </PlatformRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <PlatformRoute>
              <AdminLayout>
                <UserPage />
              </AdminLayout>
            </PlatformRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users/:id"
        element={
          <ProtectedRoute>
            <PlatformRoute>
              <AdminLayout>
                <UserDetailsPage />
              </AdminLayout>
            </PlatformRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/user-access"
        element={
          <ProtectedRoute>
            <PlatformRoute>
              <AdminLayout>
                <UserAccessPage />
              </AdminLayout>
            </PlatformRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/user-access/:id"
        element={
          <ProtectedRoute>
            <PlatformRoute>
              <AdminLayout>
                <UserAccessDetailsPage />
              </AdminLayout>
            </PlatformRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute>
            <PlatformRoute>
              <AdminLayout>
                <AuditLogsPage />
              </AdminLayout>
            </PlatformRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/audit-logs/:id"
        element={
          <ProtectedRoute>
            <PlatformRoute>
              <AdminLayout>
                <AuditLogDetailsModal />
              </AdminLayout>
            </PlatformRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/metrics"
        element={
          <ProtectedRoute>
            <PlatformRoute>
              <AdminLayout>
                <MetricsPage />
              </AdminLayout>
            </PlatformRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/billing"
        element={
          <ProtectedRoute>
            <PlatformRoute>
              <AdminLayout>
                <BillingPage />
              </AdminLayout>
            </PlatformRoute>
          </ProtectedRoute>
        }
      />
      {/* =====================================================
       * 404 / Unknown Routes
       * ===================================================*/}
      <Route
        path="*"
        element={
          accessToken ? (
            scope === "PLATFORM" ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}
