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
      state.companies = action.payload.companies || [];
    },

    setSelected: (state, action) => {
      state.selected = action.payload.companyId ?? null;
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