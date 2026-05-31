import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: null,
  refreshToken: null,
  username: null,
  companyId: null,
  role: null,
  scope: null,
  isAuthenticated: false,
  logoutLoading: false,
};

const clearAuthState = (state) => {
  state.accessToken = null;
  state.refreshToken = null;
  state.username = null;
  state.companyId = null;
  state.role = null;
  state.scope = null;
  state.isAuthenticated = false;
  state.logoutLoading = false;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.accessToken = action.payload.accessToken ?? state.accessToken;
      state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
      state.user = action.payload.user ?? state.user;
      state.scope = action.payload.scope ?? state.scope;
      state.role = action.payload.role ?? state.role;
      state.companyId = action.payload.companyId ?? state.companyId;
    },
    setAuth: (state, action) => {
      state.accessToken = action.payload.accessToken ?? null;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.username = action.payload.username ?? null;
      state.companyId = action.payload.companyId ?? null;
      state.role = action.payload.role ?? null;
      state.scope = action.payload.scope ?? null;
      state.isAuthenticated = !!action.payload.accessToken;
    },

    updateAccessToken: (state, action) => {
      state.accessToken = action.payload.accessToken ?? null;
      state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
      state.companyId = action.payload.companyId ?? state.companyId;
      state.role = action.payload.role ?? state.role;
      state.scope = action.payload.scope ?? state.scope;
      state.username = action.payload.username ?? state.username;
      state.isAuthenticated = !!state.accessToken;
    },

    setCompanyContext: (state, action) => {
      state.companyId = action.payload.companyId ?? null;
      if (action.payload.role !== undefined) {
        state.role = action.payload.role;
      }
    },

    setLogoutLoading: (state, action) => {
      state.logoutLoading = !!action.payload;
    },

    logout: (state) => {
      clearAuthState(state);
    },
  },
});

export const {
  setCredentials,
  setAuth,
  updateAccessToken,
  setCompanyContext,
  setLogoutLoading,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
