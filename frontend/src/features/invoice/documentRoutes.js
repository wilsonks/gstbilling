export function resolveDocumentDetailPath(document) {
  const documentType = document?.documentType || "TAX_INVOICE";
  const id = document?.id;

  if (!id) return "/invoices";

  switch (documentType) {
    case "PROFORMA_INVOICE":
      return `/proforma-invoices/${id}`;
    case "TAX_INVOICE":
    default:
      return `/invoices/${id}`;
  }
}

export function resolveDocumentListPath(documentType) {
  switch (documentType) {
    case "PROFORMA_INVOICE":
      return "/proforma-invoices";
    case "TAX_INVOICE":
    default:
      return "/invoices";
  }
}

export function resolveDocumentCreatePath(documentType) {
  switch (documentType) {
    case "PROFORMA_INVOICE":
      return "/proforma-invoices/new";
    case "TAX_INVOICE":
    default:
      return "/invoices/new";
  }
}