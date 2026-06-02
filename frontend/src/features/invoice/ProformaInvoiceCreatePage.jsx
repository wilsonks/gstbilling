import React from "react";
import DocumentCreateModal from "./components/DocumentCreateModal";

export default function ProformaInvoiceCreatePage() {
  return (
    <DocumentCreateModal
      documentType="PROFORMA_INVOICE"
      title="Create Proforma Invoice"
      description="Create a new proforma invoice for a customer."
      successTitle="Proforma invoice created"
    />
  );
}