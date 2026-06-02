import React from "react";
import DocumentCreateModal from "./components/DocumentCreateModal";

export default function TaxInvoiceCreatePage() {
  return (
    <DocumentCreateModal
      documentType="TAX_INVOICE"
      title="Create Tax Invoice"
      description="Create a new tax invoice for a customer."
      successTitle="Tax invoice created"
    />
  );
}