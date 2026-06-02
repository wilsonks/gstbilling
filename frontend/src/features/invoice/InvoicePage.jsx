import React from "react";
import DocumentListPage from "./components/DocumentListPage";

export default function InvoicePage() {
  return (
    <DocumentListPage
      title="Tax Invoices"
      description="View, search, manage, print, and export tax invoices."
      documentType="TAX_INVOICE"
      createLabel="New Tax Invoice"
      createPath="/invoices/new"
    />
  );
}