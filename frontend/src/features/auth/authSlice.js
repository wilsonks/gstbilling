import { createSlice } from "@reduxjs/toolkit";

const AUTH_STORAGE_KEY = "gstbilling_auth";

function loadPersistedAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persistAuth(state) {
  try {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        username: state.username,
        companyId: state.companyId,
        role: state.role,
        scope: state.scope,
        isAuthenticated: state.isAuthenticated,
      }),
    );
  } catch {
    // ignore
  }
}

function clearPersistedAuth() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }
}

const persistedAuth = loadPersistedAuth();

const baseState = {
  accessToken: null,
  refreshToken: null,
  username: null,
  companyId: null,
  role: null,
  scope: null,
  isAuthenticated: false,
  logoutLoading: false,
};

const initialState = persistedAuth
  ? {
      ...baseState,
      ...persistedAuth,
      isAuthenticated: !!persistedAuth.accessToken,
    }
  : baseState;

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
    hydrateAuth: (state) => {
      const persisted = loadPersistedAuth();
      if (!persisted) return;

      state.accessToken = persisted.accessToken ?? null;
      state.refreshToken = persisted.refreshToken ?? null;
      state.username = persisted.username ?? null;
      state.companyId = persisted.companyId ?? null;
      state.role = persisted.role ?? null;
      state.scope = persisted.scope ?? null;
      state.isAuthenticated = !!persisted.accessToken;
    },

    setCredentials: (state, action) => {
      state.accessToken = action.payload.accessToken ?? state.accessToken;
      state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
      state.username = action.payload.username ?? state.username;
      state.companyId = action.payload.companyId ?? state.companyId;
      state.role = action.payload.role ?? state.role;
      state.scope = action.payload.scope ?? state.scope;
      state.isAuthenticated = !!state.accessToken;
      persistAuth(state);
    },

    setAuth: (state, action) => {
      state.accessToken = action.payload.accessToken ?? null;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.username = action.payload.username ?? null;
      state.companyId = action.payload.companyId ?? null;
      state.role = action.payload.role ?? null;
      state.scope = action.payload.scope ?? null;
      state.isAuthenticated = !!action.payload.accessToken;
      persistAuth(state);
    },

    updateAccessToken: (state, action) => {
      state.accessToken = action.payload.accessToken ?? null;
      state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
      state.username = action.payload.username ?? state.username;
      state.companyId = action.payload.companyId ?? state.companyId;
      state.role = action.payload.role ?? state.role;
      state.scope = action.payload.scope ?? state.scope;
      state.isAuthenticated = !!state.accessToken;
      persistAuth(state);
    },

    setCompanyContext: (state, action) => {
      state.companyId = action.payload.companyId ?? null;
      if (action.payload.role !== undefined) {
        state.role = action.payload.role;
      }
      persistAuth(state);
    },

    setLogoutLoading: (state, action) => {
      state.logoutLoading = !!action.payload;
    },

    logout: (state) => {
      clearAuthState(state);
      clearPersistedAuth();
    },
  },
});

export const {
  hydrateAuth,
  setCredentials,
  setAuth,
  updateAccessToken,
  setCompanyContext,
  setLogoutLoading,
  logout,
} = authSlice.actions;

export default authSlice.reducer;