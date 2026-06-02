import React from "react";
import DocumentDetailsModal from "./components/DocumentDetailsModal";

export default function ProformaInvoiceDetailsPage() {
  return (
    <DocumentDetailsModal
      expectedDocumentType="PROFORMA_INVOICE"
      title="Proforma Invoice"
    />
  );
}