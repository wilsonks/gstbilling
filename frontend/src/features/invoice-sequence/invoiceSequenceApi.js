import api from "../../services/api";

export async function getInvoiceSequences() {
  const response = await api.get("/api/invoice-sequences/mine");
  return response.data || [];
}

export async function getAllInvoiceSequences() {
  const response = await api.get("/api/invoice-sequences");
  return response.data || [];
}

export async function getInvoiceSequenceById(id) {
  const response = await api.get(`/api/invoice-sequences/${id}`);
  return response.data;
}

export async function createInvoiceSequence(payload) {
  const response = await api.post("/api/invoice-sequences", payload);
  return response.data;
}

export async function updateInvoiceSequence(id, payload) {
  const response = await api.put(`/api/invoice-sequences/${id}`, payload);
  return response.data;
}

export async function deactivateInvoiceSequence(id) {
  const response = await api.post(`/api/invoice-sequences/${id}/deactivate`);
  return response.data;
}

export async function reactivateInvoiceSequence(id) {
  const response = await api.post(`/api/invoice-sequences/${id}/reactivate`);
  return response.data;
}

export async function getNextInvoiceNumber(documentType) {
  const response = await api.post("/api/invoice-sequences/next-number", null, {
    params: { documentType },
  });
  return response.data;
}