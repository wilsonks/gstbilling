import React from "react";
import DocumentCreateForm from "./components/DocumentCreateForm";

export default function DebitNoteCreatePage() {
  return (
    <DocumentCreateForm
      documentType="DEBIT_NOTE"
      title="Create Debit Note"
      description="Create a debit note against an existing tax invoice."
      successTitle="Debit note created"
    />
  );
}