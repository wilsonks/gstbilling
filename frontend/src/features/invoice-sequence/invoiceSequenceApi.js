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

export async function downloadInvoiceSequenceTemplate() {
  const response = await api.get("/api/invoice-sequences/template", {
    responseType: "blob",
  });

  return response.data;
}

export async function exportInvoiceSequences() {
  const response = await api.get("/api/invoice-sequences/export", {
    responseType: "blob",
  });

  return response.data;
}

export async function validateInvoiceSequenceImport(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/api/invoice-sequences/import/validate",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

export async function commitInvoiceSequenceImport(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/api/invoice-sequences/import/commit",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

export async function downloadInvoiceSequenceImportErrors(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/api/invoice-sequences/import/errors",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "blob",
    },
  );

  return response.data;
}
