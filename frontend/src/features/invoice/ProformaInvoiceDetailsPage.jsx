import React from "react";
import DocumentDetailsPage from "./components/DocumentDetailsPage";

export default function ProformaInvoiceDetailsPage() {
  return (
    <DocumentDetailsPage
      expectedDocumentType="PROFORMA_INVOICE"
      title="Proforma Invoice"
    />
  );
}