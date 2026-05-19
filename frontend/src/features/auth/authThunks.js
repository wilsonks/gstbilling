import api from "../../services/api";
import { logout, setLogoutLoading } from "./authSlice";
import { setCompanyList, setSelected } from "../company/companySlice";

export const logoutUser = () => async (dispatch) => {
  dispatch(setLogoutLoading(true));

  try {
    await api.post("/api/auth/logout");
  } catch (error) {
    console.error("Logout request failed:", error);
  } finally {
    dispatch(setCompanyList({ companies: [] }));
    dispatch(setSelected({ companyId: null }));
    dispatch(logout());
  }
};
