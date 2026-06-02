import React from "react";
import DocumentListPage from "./components/DocumentListPage";

export default function DebitNotePage() {
  return (
    <DocumentListPage
      title="Debit Notes"
      description="Manage debit notes raised against tax invoices."
      documentType="DEBIT_NOTE"
      createLabel="Create Debit Note"
      createPath="/debit-notes/new"
    />
  );
}