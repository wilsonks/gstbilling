import React from "react";
import DocumentDetailsModal from "./components/DocumentDetailsModal";

export default function InvoiceDetailsPage() {
  return (
    <DocumentDetailsModal
      expectedDocumentType="TAX_INVOICE"
      title="Tax Invoice"
    />
  );
}