import React from "react";
import DocumentDetailsPage from "./components/DocumentDetailsPage";

export default function CreditNoteDetailsPage() {
  return (
    <DocumentDetailsPage
      expectedDocumentType="CREDIT_NOTE"
      title="Credit Note"
    />
  );
}