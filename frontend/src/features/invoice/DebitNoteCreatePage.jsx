import React from "react";
import DocumentCreateModal from "./components/DocumentCreateModal";

export default function DebitNoteCreatePage() {
  return (
    <DocumentCreateModal
      documentType="DEBIT_NOTE"
      title="Create Debit Note"
      description="Create a debit note against an existing tax invoice."
      successTitle="Debit note created"
    />
  );
}