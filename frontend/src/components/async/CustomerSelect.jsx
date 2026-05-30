import React, { useCallback } from "react";
import AsyncEntitySelect from "./AsyncEntitySelect";
import { getMyCustomers } from "../../features/customer/customerApi";

export default function CustomerSelect({
  value,
  onChange,
  placeholder = "Select customer",
  isDisabled = false,
}) {
  const loadOptions = useCallback(async () => {
    return await getMyCustomers();
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
        `${item.code || item.id} - ${item.legalName || item.name || "Customer"}`
      }
    />
  );
}