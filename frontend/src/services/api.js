import axios from "axios";
import { store } from "../app/store";
import { setAuth, logout } from "../features/auth/authSlice";
import { setSelected, setCompanyList } from "../features/company/companySlice";
import { decodeJwt } from "../utils/jwt";

const api = axios.create({
  baseURL: "/",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue = [];

function flushRefreshQueue(token) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

function clearClientSession() {
  store.dispatch(logout());
  store.dispatch(setCompanyList({ companies: [] }));
  store.dispatch(setSelected({ companyId: null }));
}

api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.accessToken;
  const companyId = state.company?.selected || state.auth.companyId;
  const scope = state.auth.scope;

  const isRefreshCall = config.url?.includes("/api/auth/refresh");

  if (token && !isRefreshCall) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (scope === "TENANT" && companyId) {
    config.headers["X-Company-Id"] = companyId;
  } else if (config.headers["X-Company-Id"]) {
    delete config.headers["X-Company-Id"];
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    const isLoginCall = originalRequest?.url?.includes("/api/auth/login");
    const isRefreshCall = originalRequest?.url?.includes("/api/auth/refresh");
    const isLogoutCall = originalRequest?.url?.includes("/api/auth/logout");

    if (isLoginCall || isRefreshCall || isLogoutCall) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (!token) {
              reject(error);
              return;
            }

            const state = store.getState();
            const scope = state.auth.scope;
            const companyId = state.company?.selected || state.auth.companyId;

            originalRequest.headers.Authorization = `Bearer ${token}`;

            if (scope === "TENANT" && companyId) {
              originalRequest.headers["X-Company-Id"] = companyId;
            } else if (originalRequest.headers["X-Company-Id"]) {
              delete originalRequest.headers["X-Company-Id"];
            }

            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          "/api/auth/refresh",
          {},
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          },
        );

        const newAccessToken = res.data.accessToken;
        const decoded = decodeJwt(newAccessToken);

        const nextRole =
          res.data.role ?? decoded.role ?? decoded.platformRole ?? null;
        const nextScope = decoded.scope ?? null;
        const nextCompanyId = res.data.companyId ?? decoded.companyId ?? null;

        store.dispatch(
          setAuth({
            accessToken: newAccessToken,
            refreshToken: res.data.refreshToken,
            username: res.data.username,
            companyId: nextCompanyId,
            role: nextRole,
            scope: nextScope,
          }),
        );

        if (nextScope === "TENANT") {
          store.dispatch(
            setCompanyList({ companies: res.data.companies || [] }),
          );
          store.dispatch(setSelected({ companyId: nextCompanyId }));
        } else {
          store.dispatch(setCompanyList({ companies: [] }));
          store.dispatch(setSelected({ companyId: null }));
        }

        flushRefreshQueue(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        if (nextScope === "TENANT" && nextCompanyId) {
          originalRequest.headers["X-Company-Id"] = nextCompanyId;
        } else if (originalRequest.headers["X-Company-Id"]) {
          delete originalRequest.headers["X-Company-Id"];
        }

        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        flushRefreshQueue(null);
        clearClientSession();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
