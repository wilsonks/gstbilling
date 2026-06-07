import api from "../../services/api";

function unwrapPageContent(data) {
  if (Array.isArray(data)) return data;
  return data?.content || [];
}

export async function getProducts(params = {}) {
  const response = await api.get("/api/products", { params });
  return unwrapPageContent(response.data);
}

export async function getProductsPage(params = {}) {
  const response = await api.get("/api/products", { params });
  return response.data;
}

export async function getMyProducts() {
  const response = await api.get("/api/products/mine");
  return response.data || [];
}

export async function getProductById(id) {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
}

export async function getProductStats() {
  const response = await api.get("/api/products/stats");
  return (
    response.data || {
      total: 0,
      active: 0,
      inactive: 0,
      recentProducts: [],
    }
  );
}

export async function createProduct(payload) {
  const response = await api.post("/api/products", payload);
  return response.data;
}

export async function updateProduct(id, payload) {
  const response = await api.put(`/api/products/${id}`, payload);
  return response.data;
}

export async function deactivateProduct(id) {
  const response = await api.post(`/api/products/${id}/deactivate`);
  return response.data;
}

export async function reactivateProduct(id) {
  const response = await api.post(`/api/products/${id}/reactivate`);
  return response.data;
}

export async function getHsnSacMasters() {
  const response = await api.get("/api/masters/hsn-sac");
  return response.data || [];
}

export async function getUnitMasters() {
  const response = await api.get("/api/masters/units");
  return response.data || [];
}

export async function getGstSlabMasters() {
  const response = await api.get("/api/masters/gst-slabs");
  return response.data || [];
}

export async function downloadProductTemplate() {
  const response = await api.get("/api/products/template", {
    responseType: "blob",
  });

  return response.data;
}
export async function exportProducts() {
  const response = await api.get("/api/products/export", {
    responseType: "blob",
  });

  return response.data;
}
export async function validateProductImport(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/api/products/import/validate", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function commitProductImport(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/api/products/import/commit", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
export async function downloadProductImportErrors(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/api/products/import/errors", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    responseType: "blob",
  });

  return response.data;
}
