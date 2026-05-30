import React, { useEffect, useState } from "react";
import { Select, Spinner, InputGroup, InputRightElement } from "@chakra-ui/react";

export default function AsyncEntitySelect({
  value,
  onChange,
  loadOptions,
  getOptionValue = (item) => item.id,
  getOptionLabel = (item) => item.name,
  placeholder = "Select option",
  isDisabled = false,
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      try {
        const data = await loadOptions();
        if (active) setOptions(data || []);
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [loadOptions]);

  return (
    <InputGroup>
      <Select
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        isDisabled={isDisabled || loading}
      >
        {options.map((item) => (
          <option key={getOptionValue(item)} value={getOptionValue(item)}>
            {getOptionLabel(item)}
          </option>
        ))}
      </Select>
      {loading && (
        <InputRightElement>
          <Spinner size="sm" />
        </InputRightElement>
      )}
    </InputGroup>
  );
}