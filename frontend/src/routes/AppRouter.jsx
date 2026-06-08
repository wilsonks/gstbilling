import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import RequirePasswordChange from "./RequirePasswordChange";

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
import ChangePasswordPage from "../features/user/ChangePasswordPage";
import ProductPage from "../features/product/ProductPage";
import CustomerPage from "../features/customer/CustomerPage";
import InvoiceSequencePage from "../features/invoice-sequence/InvoiceSequencePage";

import InvoicePage from "../features/invoice/InvoicePage";
import TaxInvoiceCreatePage from "../features/invoice/TaxInvoiceCreatePage";
import InvoiceDetailsPage from "../features/invoice/InvoiceDetailsPage";

import ProformaInvoicePage from "../features/invoice/ProformaInvoicePage";
import ProformaInvoiceCreatePage from "../features/invoice/ProformaInvoiceCreatePage";
import ProformaInvoiceDetailsPage from "../features/invoice/ProformaInvoiceDetailsPage";

import CreditNotePage from "../features/invoice/CreditNotePage";
import CreditNoteCreatePage from "../features/invoice/CreditNoteCreatePage";
import CreditNoteDetailsPage from "../features/invoice/CreditNoteDetailsPage";

import DebitNotePage from "../features/invoice/DebitNotePage";
import DebitNoteCreatePage from "../features/invoice/DebitNoteCreatePage";
import DebitNoteDetailsPage from "../features/invoice/DebitNoteDetailsPage";

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

function AppRouterContent() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;
  const { accessToken, scope } = useSelector((state) => state.auth);

  const tenantWrapped = (element) => (
    <ProtectedRoute>
      <AppLayout>{element}</AppLayout>
    </ProtectedRoute>
  );

  const adminWrapped = (element) => (
    <ProtectedRoute>
      <PlatformRoute>
        <AdminLayout>{element}</AdminLayout>
      </PlatformRoute>
    </ProtectedRoute>
  );

  return (
    <>
      <Routes location={backgroundLocation || location}>
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
          path="/change-password"
          element={tenantWrapped(<ChangePasswordPage />)}
        />
        <Route
          path="/dashboard"
          element={tenantWrapped(<TenantDashboardPage />)}
        />
        <Route
          path="/companies"
          element={tenantWrapped(<TenantCompanyPage />)}
        />
        <Route path="/users" element={tenantWrapped(<TenantUserPage />)} />
        <Route
          path="/user-access"
          element={tenantWrapped(<TenantUserAccessPage />)}
        />
        <Route path="/products" element={tenantWrapped(<ProductPage />)} />
        <Route path="/customers" element={tenantWrapped(<CustomerPage />)} />
        <Route
          path="/invoice-sequences"
          element={tenantWrapped(<InvoiceSequencePage />)}
        />

        <Route path="/invoices" element={tenantWrapped(<InvoicePage />)} />
        <Route
          path="/invoices/new"
          element={tenantWrapped(<TaxInvoiceCreatePage />)}
        />
        <Route
          path="/invoices/:id"
          element={tenantWrapped(<InvoiceDetailsPage />)}
        />

        <Route
          path="/proforma-invoices"
          element={tenantWrapped(<ProformaInvoicePage />)}
        />
        <Route
          path="/proforma-invoices/new"
          element={tenantWrapped(<ProformaInvoiceCreatePage />)}
        />
        <Route
          path="/proforma-invoices/:id"
          element={tenantWrapped(<ProformaInvoiceDetailsPage />)}
        />

        <Route
          path="/credit-notes"
          element={tenantWrapped(<CreditNotePage />)}
        />
        <Route
          path="/credit-notes/new"
          element={tenantWrapped(<CreditNoteCreatePage />)}
        />
        <Route
          path="/credit-notes/:id"
          element={tenantWrapped(<CreditNoteDetailsPage />)}
        />

        <Route path="/debit-notes" element={tenantWrapped(<DebitNotePage />)} />
        <Route
          path="/debit-notes/new"
          element={tenantWrapped(<DebitNoteCreatePage />)}
        />
        <Route
          path="/debit-notes/:id"
          element={tenantWrapped(<DebitNoteDetailsPage />)}
        />

        {/* Legacy redirects */}
        <Route path="/invoice" element={<Navigate to="/invoices" replace />} />
        <Route
          path="/invoice/new"
          element={<Navigate to="/invoices/new" replace />}
        />
        <Route path="/parties" element={<Navigate to="/customers" replace />} />

        <Route path="/admin" element={adminWrapped(<DashboardPage />)} />
        <Route path="/admin/tenants" element={adminWrapped(<TenantPage />)} />
        <Route
          path="/admin/tenants/:id"
          element={adminWrapped(<TenantDetailsPage />)}
        />
        <Route
          path="/admin/companies"
          element={adminWrapped(<CompanyPage />)}
        />
        <Route
          path="/admin/companies/:id"
          element={adminWrapped(<CompanyDetailsPage />)}
        />
        <Route path="/admin/users" element={adminWrapped(<UserPage />)} />
        <Route
          path="/admin/users/:id"
          element={adminWrapped(<UserDetailsPage />)}
        />
        <Route
          path="/admin/user-access"
          element={adminWrapped(<UserAccessPage />)}
        />
        <Route
          path="/admin/user-access/:id"
          element={adminWrapped(<UserAccessDetailsPage />)}
        />
        <Route
          path="/admin/audit-logs"
          element={adminWrapped(<AuditLogsPage />)}
        />
        <Route
          path="/admin/audit-logs/:id"
          element={adminWrapped(<AuditLogDetailsModal />)}
        />
        <Route path="/admin/metrics" element={adminWrapped(<MetricsPage />)} />
        <Route path="/admin/billing" element={adminWrapped(<BillingPage />)} />

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

      {backgroundLocation && (
        <Routes>
          <Route
            path="/invoices/new"
            element={tenantWrapped(<TaxInvoiceCreatePage />)}
          />
          <Route
            path="/invoices/:id"
            element={tenantWrapped(<InvoiceDetailsPage />)}
          />

          <Route
            path="/proforma-invoices/new"
            element={tenantWrapped(<ProformaInvoiceCreatePage />)}
          />
          <Route
            path="/proforma-invoices/:id"
            element={tenantWrapped(<ProformaInvoiceDetailsPage />)}
          />

          <Route
            path="/credit-notes/new"
            element={tenantWrapped(<CreditNoteCreatePage />)}
          />
          <Route
            path="/credit-notes/:id"
            element={tenantWrapped(<CreditNoteDetailsPage />)}
          />

          <Route
            path="/debit-notes/new"
            element={tenantWrapped(<DebitNoteCreatePage />)}
          />
          <Route
            path="/debit-notes/:id"
            element={tenantWrapped(<DebitNoteDetailsPage />)}
          />
        </Routes>
      )}
    </>
  );
}

export default function AppRouter() {
  return <AppRouterContent />;
}
