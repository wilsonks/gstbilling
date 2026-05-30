import React, { useCallback } from "react";
import AsyncEntitySelect from "./AsyncEntitySelect";
import { getMyCompanies } from "../../features/company/companyApi";

export default function CompanySelect({
  value,
  onChange,
  placeholder = "Select company",
  isDisabled = false,
}) {
  const loadOptions = useCallback(async () => {
    return await getMyCompanies();
  }, []);

  return (
    <AsyncEntitySelect
      value={value}
      onChange={onChange}
      loadOptions={loadOptions}
      placeholder={placeholder}
      isDisabled={isDisabled}
      getOptionValue={(item) => String(item.id)}
      getOptionLabel={(item) =>
        `${item.name || "Company"}${item.gstin ? ` - ${item.gstin}` : ""}`
      }
    />
  );
}