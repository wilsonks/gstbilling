import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  companies: [],
  selected: null,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    setCompanyList: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.companies = action.payload;
      } else {
        state.companies = action.payload?.companies || [];
      }
    },

    setSelected: (state, action) => {
      state.selected = action.payload?.companyId ?? action.payload ?? null;
    },

    clearCompanies: (state) => {
      state.companies = [];
      state.selected = null;
    },
  },
});

export const { setCompanyList, setSelected, clearCompanies } =
  companySlice.actions;

export default companySlice.reducer;
