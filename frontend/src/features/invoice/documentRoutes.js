export function resolveDocumentDetailPath(document) {
  const documentType = document?.documentType || "TAX_INVOICE";
  const id = document?.id;

  if (!id) return "/invoices";

  switch (documentType) {
    case "PROFORMA_INVOICE":
      return `/proforma-invoices/${id}`;
    case "CREDIT_NOTE":
      return `/credit-notes/${id}`;
    case "DEBIT_NOTE":
      return `/debit-notes/${id}`;
    case "TAX_INVOICE":
    default:
      return `/invoices/${id}`;
  }
}

export function resolveDocumentListPath(documentType) {
  switch (documentType) {
    case "PROFORMA_INVOICE":
      return "/proforma-invoices";
    case "CREDIT_NOTE":
      return "/credit-notes";
    case "DEBIT_NOTE":
      return "/debit-notes";
    case "TAX_INVOICE":
    default:
      return "/invoices";
  }
}

export function resolveDocumentCreatePath(documentType) {
  switch (documentType) {
    case "PROFORMA_INVOICE":
      return "/proforma-invoices/new";
    case "CREDIT_NOTE":
      return "/credit-notes/new";
    case "DEBIT_NOTE":
      return "/debit-notes/new";
    case "TAX_INVOICE":
    default:
      return "/invoices/new";
  }
}