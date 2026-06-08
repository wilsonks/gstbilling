import api from "../../services/api";

function unwrapPageContent(data) {
  if (Array.isArray(data)) return data;
  return data?.content || [];
}

export async function getTenantUsers(params = {}) {
  const response = await api.get("/api/users", { params });
  return unwrapPageContent(response.data);
}

export async function getTenantUsersPage(params = {}) {
  const response = await api.get("/api/users", { params });
  return response.data;
}

export async function getMyTenantUsers() {
  const response = await api.get("/api/users/mine");
  return response.data || [];
}

export async function getTenantUserById(id) {
  const response = await api.get(`/api/users/${id}`);
  return response.data;
}

export async function getTenantUserStats() {
  const response = await api.get("/api/users/stats");
  return (
    response.data || {
      total: 0,
      active: 0,
      inactive: 0,
      recentUsers: [],
    }
  );
}

export async function createTenantUser(payload) {
  const response = await api.post("/api/users", payload);
  return response.data;
}

export async function updateTenantUser(id, payload) {
  const response = await api.put(`/api/users/${id}`, payload);
  return response.data;
}

export async function deactivateTenantUser(id) {
  const response = await api.post(`/api/users/${id}/deactivate`);
  return response.data;
}

export async function reactivateTenantUser(id) {
  const response = await api.post(`/api/users/${id}/reactivate`);
  return response.data;
}

export async function downloadUserTemplate() {
  const response = await api.get("/api/users/template", {
    responseType: "blob",
  });

  return response.data;
}

export async function exportUsersExcel() {
  const response = await api.get("/api/users/export", {
    responseType: "blob",
  });

  return response.data;
}

export async function validateUserImport(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/api/users/import/validate", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function commitUserImport(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/api/users/import/commit", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function downloadUserImportErrors(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/api/users/import/errors", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    responseType: "blob",
  });

  return response.data;
}

export async function resetUserPassword(id) {
  const response = await api.post(`/api/users/${id}/reset-password`);

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/api/users/me");

  return response.data;
}

export async function changePassword(payload) {
  const response = await api.post("/api/users/change-password", payload);

  return response.data;
}
