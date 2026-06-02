import React from "react";
import DocumentCreateForm from "./components/DocumentCreateForm";

export default function CreditNoteCreatePage() {
  return (
    <DocumentCreateForm
      documentType="CREDIT_NOTE"
      title="Create Credit Note"
      description="Create a credit note against an existing tax invoice."
      successTitle="Credit note created"
    />
  );
}