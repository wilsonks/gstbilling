import api from "../../services/api";

function unwrapPageContent(data) {
  if (Array.isArray(data)) return data;
  return data?.content || [];
}

export async function getInvoices(params = {}) {
  const response = await api.get("/api/invoices", { params });
  return unwrapPageContent(response.data);
}

export async function getInvoicesPage(params = {}) {
  const response = await api.get("/api/invoices", { params });
  return response.data;
}

export async function getInvoiceById(id) {
  const response = await api.get(`/api/invoices/${id}`);
  return response.data;
}

export async function getInvoiceStats() {
  const response = await api.get("/api/invoices/stats");
  return (
    response.data || {
      total: 0,
      recentInvoices: [],
    }
  );
}

export async function createInvoice(payload) {
  const response = await api.post("/api/invoices", payload);
  return response.data;
}

export async function cancelInvoice(id) {
  const response = await api.post(`/api/invoices/${id}/cancel`);
  return response.data;
}

export async function convertProformaToTaxInvoice(id) {
  const response = await api.post(`/api/invoices/${id}/convert-to-tax-invoice`);
  return response.data;
}

export async function exportInvoicePdf(id) {
  const response = await api.get(`/api/invoices/${id}/export/pdf`, {
    responseType: "blob",
  });
  return response;
}

export async function previewInvoicePdf(id) {
  const response = await api.get(`/api/invoices/${id}/export/pdf?disposition=inline`, {
    responseType: "blob",
  });
  return response;
}