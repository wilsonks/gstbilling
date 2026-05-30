import React, { useCallback } from "react";
import AsyncEntitySelect from "./AsyncEntitySelect";
import { getMyProducts } from "../../features/product/productApi";

export default function ProductSelect({
  value,
  onChange,
  placeholder = "Select product",
  isDisabled = false,
}) {
  const loadOptions = useCallback(async () => {
    return await getMyProducts();
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
        `${item.code || item.id} - ${item.name || "Product"}`
      }
    />
  );
}