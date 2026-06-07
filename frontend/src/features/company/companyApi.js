import api from "../../services/api";

function unwrapPageContent(data) {
  if (Array.isArray(data)) return data;
  return data?.content || [];
}

export async function getMyCompanies() {
  const response = await api.get("/api/companies/mine");
  return response.data || [];
}

export async function getCompanies(params = {}) {
  const response = await api.get("/api/companies", { params });
  return unwrapPageContent(response.data);
}

export async function getCompaniesPage(params = {}) {
  const response = await api.get("/api/companies", { params });
  return response.data;
}

export async function getCompanyById(id) {
  const response = await api.get(`/api/companies/${id}`);
  return response.data;
}

export async function getCompanyStats() {
  const response = await api.get("/api/companies/stats");
  return (
    response.data || {
      total: 0,
      active: 0,
      inactive: 0,
      recentCompanies: [],
    }
  );
}

export async function createCompany(payload) {
  const response = await api.post("/api/companies", payload);
  return response.data;
}

export async function updateCompany(id, payload) {
  const response = await api.put(`/api/companies/${id}`, payload);
  return response.data;
}

export async function deactivateCompany(id) {
  const response = await api.post(`/api/companies/${id}/deactivate`);
  return response.data;
}

export async function reactivateCompany(id) {
  const response = await api.post(`/api/companies/${id}/reactivate`);
  return response.data;
}

export async function downloadCompanyTemplate() {
  const response = await api.get("/api/companies/template", {
    responseType: "blob",
  });

  return response.data;
}

export async function exportCompaniesExcel() {
  const response = await api.get("/api/companies/export", {
    responseType: "blob",
  });

  return response.data;
}

export async function validateCompanyImport(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/api/companies/import/validate", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function commitCompanyImport(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/api/companies/import/commit", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function downloadCompanyImportErrors(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/api/companies/import/errors", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    responseType: "blob",
  });

  return response.data;
}
