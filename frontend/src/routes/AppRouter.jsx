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
import TenantDashboardPage from "../features/tenant/TenantDashboardPage";
import TenantCompanyPage from "../features/company/TenantCompanyPage";
import TenantUserPage from "../features/user/TenantUserPage";
import TenantUserAccessPage from "../features/user-access/TenantUserAccessPage";
import ProductPage from "../features/product/ProductPage";
import CustomerPage from "../features/customer/CustomerPage";
import InvoiceSequencePage from "../features/invoice-sequence/InvoiceSequencePage";

import InvoicePage from "../features/invoice/InvoicePage";
import TaxInvoiceCreatePage from "../features/invoice/TaxInvoiceCreatePage";
import InvoiceDetailsPage from "../features/invoice/InvoiceDetailsPage";

import ProformaInvoicePage from "../features/invoice/ProformaInvoicePage";
import ProformaInvoiceCreatePage from "../features/invoice/ProformaInvoiceCreatePage";
import ProformaInvoiceDetailsPage from "../features/invoice/ProformaInvoiceDetailsPage";

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
import MetricsPage from "../features/admin/MetricsPage";
import BillingPage from "../features/admin/BillingPage";

export default function AppRouter() {
  const { accessToken, scope } = useSelector((state) => state.auth);

  return (
    <Routes>
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

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TenantDashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/companies"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TenantCompanyPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TenantUserPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/user-access"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TenantUserAccessPage />
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
        path="/customers"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CustomerPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoice-sequences"
        element={
          <ProtectedRoute>
            <AppLayout>
              <InvoiceSequencePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Tax Invoices */}
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <AppLayout>
              <InvoicePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices/new"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TaxInvoiceCreatePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <InvoiceDetailsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Proforma Invoices */}
      <Route
        path="/proforma-invoices"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProformaInvoicePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/proforma-invoices/new"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProformaInvoiceCreatePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/proforma-invoices/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProformaInvoiceDetailsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Legacy redirects */}
      <Route path="/invoice" element={<Navigate to="/invoices" replace />} />
      <Route path="/invoice/new" element={<Navigate to="/invoices/new" replace />} />
      <Route path="/parties" element={<Navigate to="/customers" replace />} />

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