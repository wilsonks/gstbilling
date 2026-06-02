import React from "react";
import DocumentListPage from "./components/DocumentListPage";

export default function CreditNotePage() {
  return (
    <DocumentListPage
      title="Credit Notes"
      description="Manage credit notes raised against tax invoices."
      documentType="CREDIT_NOTE"
      createLabel="Create Credit Note"
      createPath="/credit-notes/new"
    />
  );
}