import api from "../../services/api";

export async function switchCompany(companyId) {
  const response = await api.post("/api/auth/switch-company", { companyId });
  return response.data;
}