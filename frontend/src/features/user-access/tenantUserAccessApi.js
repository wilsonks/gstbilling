import api from "../../services/api";

function unwrapPageContent(data) {
  if (Array.isArray(data)) return data;
  return data?.content || [];
}

export async function getTenantUserAccess(params = {}) {
  const response = await api.get("/api/user-access", { params });
  return unwrapPageContent(response.data);
}

export async function getTenantUserAccessPage(params = {}) {
  const response = await api.get("/api/user-access", { params });
  return response.data;
}

export async function getMyTenantUserAccess() {
  const response = await api.get("/api/user-access/mine");
  return response.data || [];
}

export async function getTenantUserAccessById(id) {
  const response = await api.get(`/api/user-access/${id}`);
  return response.data;
}

export async function getTenantUserAccessStats() {
  const response = await api.get("/api/user-access/stats");
  return (
    response.data || {
      total: 0,
      active: 0,
      inactive: 0,
      recentAccess: [],
    }
  );
}

export async function createTenantUserAccess(payload) {
  const response = await api.post("/api/user-access", payload);
  return response.data;
}

export async function updateTenantUserAccess(id, payload) {
  const response = await api.put(`/api/user-access/${id}`, payload);
  return response.data;
}

export async function deactivateTenantUserAccess(id) {
  const response = await api.post(`/api/user-access/${id}/deactivate`);
  return response.data;
}

export async function reactivateTenantUserAccess(id) {
  const response = await api.post(`/api/user-access/${id}/reactivate`);
  return response.data;
}