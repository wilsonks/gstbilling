import React from "react";
import DocumentDetailsPage from "./components/DocumentDetailsPage";

export default function DebitNoteDetailsPage() {
  return (
    <DocumentDetailsPage
      expectedDocumentType="DEBIT_NOTE"
      title="Debit Note"
    />
  );
}