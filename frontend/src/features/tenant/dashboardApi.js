import api from "../../services/api";

export async function getDashboardSummary() {
  const response = await api.get("/dashboard/summary");

  return response.data;
}

export async function getDashboardAlerts() {
  const response = await api.get("/dashboard/alerts");

  return response.data;
}
export async function getDashboardRecentDocuments() {
  const response = await api.get("/dashboard/recent-documents");
  return response.data;
}
