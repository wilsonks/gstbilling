import api from "../../services/api";

function unwrapPageContent(data) {
  if (Array.isArray(data)) return data;
  return data?.content || [];
}

export async function getCustomers(params = {}) {
  const response = await api.get("/api/customers", { params });
  return unwrapPageContent(response.data);
}

export async function getCustomersPage(params = {}) {
  const response = await api.get("/api/customers", { params });
  return response.data;
}

export async function getMyCustomers() {
  const response = await api.get("/api/customers/mine");
  return response.data || [];
}

export async function getCustomerById(id) {
  const response = await api.get(`/api/customers/${id}`);
  return response.data;
}

export async function getCustomerStats() {
  const response = await api.get("/api/customers/stats");
  return (
    response.data || {
      total: 0,
      active: 0,
      inactive: 0,
      recentCustomers: [],
    }
  );
}

export async function createCustomer(payload) {
  const response = await api.post("/api/customers", payload);
  return response.data;
}

export async function updateCustomer(id, payload) {
  const response = await api.put(`/api/customers/${id}`, payload);
  return response.data;
}

export async function deactivateCustomer(id) {
  const response = await api.post(`/api/customers/${id}/deactivate`);
  return response.data;
}

export async function reactivateCustomer(id) {
  const response = await api.post(`/api/customers/${id}/reactivate`);
  return response.data;
}

export async function downloadCustomerTemplate() {
  const response = await api.get("/api/customers/template", {
    responseType: "blob",
  });

  return response.data;
}

export async function downloadCustomerErrors(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/api/customers/import/errors", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    responseType: "blob",
  });

  return response.data;
}

export async function exportCustomers() {
  const response = await api.get("/api/customers/export", {
    responseType: "blob",
  });

  return response.data;
}

export async function validateCustomerImport(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/api/customers/import/validate", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function commitCustomerImport(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/api/customers/import/commit", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
