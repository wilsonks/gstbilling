import React from "react";
import DocumentDetailsModal from "./components/DocumentDetailsModal";

export default function DebitNoteDetailsPage() {
  return (
    <DocumentDetailsModal
      expectedDocumentType="DEBIT_NOTE"
      title="Debit Note"
    />
  );
}