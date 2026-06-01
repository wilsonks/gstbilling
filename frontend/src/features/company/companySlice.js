import { createSlice } from "@reduxjs/toolkit";

const COMPANY_STORAGE_KEY = "gstbilling_company";

function loadPersistedCompanyState() {
  try {
    const raw = localStorage.getItem(COMPANY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persistCompanyState(state) {
  try {
    localStorage.setItem(
      COMPANY_STORAGE_KEY,
      JSON.stringify({
        companies: state.companies,
        selected: state.selected,
      }),
    );
  } catch {
    // ignore storage errors
  }
}

function clearPersistedCompanyState() {
  try {
    localStorage.removeItem(COMPANY_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

const persisted = loadPersistedCompanyState();

const baseState = {
  companies: [],
  selected: null,
};

const initialState = persisted
  ? {
      ...baseState,
      ...persisted,
      companies: Array.isArray(persisted.companies) ? persisted.companies : [],
      selected: persisted.selected ?? null,
    }
  : baseState;

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    setCompanyList: (state, action) => {
      const payload = action.payload;

      if (Array.isArray(payload)) {
        state.companies = payload;
      } else if (Array.isArray(payload?.companies)) {
        state.companies = payload.companies;
      } else {
        state.companies = [];
      }

      const selectedStillExists = state.companies.some(
        (company) => Number(company.id) === Number(state.selected),
      );

      if (!selectedStillExists) {
        state.selected = state.companies.length > 0 ? state.companies[0].id : null;
      }

      persistCompanyState(state);
    },

    setSelected: (state, action) => {
      const payload = action.payload;

      if (payload && typeof payload === "object" && "companyId" in payload) {
        state.selected = payload.companyId ?? null;
      } else {
        state.selected = payload ?? null;
      }

      persistCompanyState(state);
    },

    clearCompanyState: (state) => {
      state.companies = [];
      state.selected = null;
      clearPersistedCompanyState();
    },

    hydrateCompanyState: (state) => {
      const persistedState = loadPersistedCompanyState();
      if (!persistedState) return;

      state.companies = Array.isArray(persistedState.companies)
        ? persistedState.companies
        : [];
      state.selected = persistedState.selected ?? null;
    },
  },
});

export const {
  setCompanyList,
  setSelected,
  clearCompanyState,
  hydrateCompanyState,
} = companySlice.actions;

export default companySlice.reducer;