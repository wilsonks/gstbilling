import React from "react";
import { Select } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { setSelected } from "./companySlice";
import { setCompanyContext } from "../auth/authSlice";

export default function CompanySwitcher() {
  const dispatch = useDispatch();
  const companies = useSelector((state) => state.company.companies);
  const selected = useSelector((state) => state.company.selected);

  const handleChange = (e) => {
    const companyId = e.target.value ? Number(e.target.value) : null;
    const selectedCompany = companies.find((c) => Number(c.id) === companyId);

    dispatch(setSelected({ companyId }));
    dispatch(
      setCompanyContext({
        companyId,
        role: selectedCompany?.role ?? null,
      }),
    );
  };

  if (!companies || companies.length === 0) {
    return null;
  }

  return (
    <Select
      size="sm"
      bg="white"
      color="gray.800"
      value={selected ?? ""}
      onChange={handleChange}
      width="220px"
    >
      {companies.map((company) => (
        <option key={company.id} value={company.id}>
          {company.name}
        </option>
      ))}
    </Select>
  );
}