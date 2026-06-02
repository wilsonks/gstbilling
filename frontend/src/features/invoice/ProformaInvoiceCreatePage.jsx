import React from "react";
import DocumentCreateForm from "./components/DocumentCreateForm";

export default function ProformaInvoiceCreatePage() {
  return (
    <DocumentCreateForm
      documentType="PROFORMA_INVOICE"
      title="Create Proforma Invoice"
      description="Create a proforma invoice for pre-sales or quotation-style billing."
      successTitle="Proforma invoice created"
    />
  );
}