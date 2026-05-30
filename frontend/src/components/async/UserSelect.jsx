import React, { useCallback } from "react";
import AsyncEntitySelect from "./AsyncEntitySelect";
import { getMyTenantUsers } from "../../features/user/tenantUserApi";

export default function UserSelect({
  value,
  onChange,
  placeholder = "Select user",
  isDisabled = false,
}) {
  const loadOptions = useCallback(async () => {
    return await getMyTenantUsers();
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
        `${item.username || "User"}${item.email ? ` - ${item.email}` : ""}`
      }
    />
  );
}