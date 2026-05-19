export const selectCompanies = (state) => state.company.companies;
export const selectSelectedCompanyId = (state) => state.company.selected;

export const selectSelectedCompany = (state) => {
  const companies = state.company.companies || [];
  const selected = state.company.selected;
  return companies.find((c) => c.id === selected) || null;
};