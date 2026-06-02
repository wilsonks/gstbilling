import React from "react";
import DocumentListPage from "./components/DocumentListPage";

export default function ProformaInvoicePage() {
  return (
    <DocumentListPage
      title="Proforma Invoices"
      description="View, search, manage, print, and export proforma invoices."
      documentType="PROFORMA_INVOICE"
      createLabel="New Proforma Invoice"
      createPath="/proforma-invoices/new"
    />
  );
}