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