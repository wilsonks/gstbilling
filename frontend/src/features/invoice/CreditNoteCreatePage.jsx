import React from "react";
import DocumentCreateModal from "./components/DocumentCreateModal";

export default function CreditNoteCreatePage() {
  return (
    <DocumentCreateModal
      documentType="CREDIT_NOTE"
      title="Create Credit Note"
      description="Create a credit note against an existing tax invoice."
      successTitle="Credit note created"
    />
  );
}