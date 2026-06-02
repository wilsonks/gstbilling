import React from "react";
import DocumentDetailsModal from "./components/DocumentDetailsModal";

export default function CreditNoteDetailsPage() {
  return (
    <DocumentDetailsModal
      expectedDocumentType="CREDIT_NOTE"
      title="Credit Note"
    />
  );
}