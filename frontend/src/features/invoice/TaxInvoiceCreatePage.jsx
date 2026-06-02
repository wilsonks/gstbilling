import React from "react";
import DocumentCreateForm from "./components/DocumentCreateForm";

export default function TaxInvoiceCreatePage() {
  return (
    <DocumentCreateForm
      documentType="TAX_INVOICE"
      title="Create Tax Invoice"
      description="Create a tax invoice with product lines, pricing, and GST preview."
      successTitle="Tax invoice created"
    />
  );
}