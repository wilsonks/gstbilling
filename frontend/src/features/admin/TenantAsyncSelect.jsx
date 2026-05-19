import React, { useEffect, useMemo, useRef, useState } from "react";
import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/react";
import { AsyncSelect } from "chakra-react-select";
import api from "../../services/api";

const MIN_SEARCH_LENGTH = 2;
const PAGE_SIZE = 10;
const DEBOUNCE_MS = 400;

function debouncePromise(fn, delay) {
  let timer;

  return (...args) =>
    new Promise((resolve) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const result = await fn(...args);
        resolve(result);
      }, delay);
    });
}

export default function TenantAsyncSelect({
  value,
  onChange,
  label = "Tenant",
  isRequired = false,
  error,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const cacheRef = useRef(new Map());

  const toOption = (tenant) => ({
    value: tenant.tenantId,
    label: `${tenant.name} (#${tenant.tenantId})`,
    tenant,
  });

  useEffect(() => {
    const fetchSelectedTenant = async () => {
      if (!value) {
        setSelectedOption(null);
        return;
      }

      const cacheKey = `tenant:${value}`;

      if (cacheRef.current.has(cacheKey)) {
        setSelectedOption(cacheRef.current.get(cacheKey));
        return;
      }

      try {
        const res = await api.get(`/api/platform/tenants/${value}`);
        const option = toOption(res.data);
        cacheRef.current.set(cacheKey, option);
        setSelectedOption(option);
      } catch {
        setSelectedOption(null);
      }
    };

    fetchSelectedTenant();
  }, [value]);

  const loadOptions = useMemo(
    () =>
      debouncePromise(async (inputValue) => {
        const query = (inputValue || "").trim();

        if (query.length < MIN_SEARCH_LENGTH) {
          return [];
        }

        const cacheKey = `search:${query}`;

        if (cacheRef.current.has(cacheKey)) {
          return cacheRef.current.get(cacheKey);
        }

        try {
          const res = await api.get("/api/platform/tenants", {
            params: {
              q: query,
              page: 0,
              size: PAGE_SIZE,
            },
          });

          const options = (res.data?.content || []).map(toOption);

          cacheRef.current.set(cacheKey, options);

          for (const option of options) {
            cacheRef.current.set(`tenant:${option.value}`, option);
          }

          return options;
        } catch {
          return [];
        }
      }, DEBOUNCE_MS),
    [],
  );

  return (
    <FormControl isInvalid={!!error} isRequired={isRequired}>
      <FormLabel>{label}</FormLabel>

      <AsyncSelect
        value={selectedOption}
        loadOptions={loadOptions}
        defaultOptions={false}
        isClearable
        cacheOptions={false}
        placeholder={`Type at least ${MIN_SEARCH_LENGTH} characters to search tenant`}
        noOptionsMessage={({ inputValue }) =>
          !inputValue || inputValue.trim().length < MIN_SEARCH_LENGTH
            ? `Type at least ${MIN_SEARCH_LENGTH} characters`
            : "No tenants found"
        }
        onChange={(option) => {
          setSelectedOption(option || null);
          onChange?.(option?.value ?? "", option?.tenant ?? null);
        }}
        chakraStyles={{
          menu: (provided) => ({
            ...provided,
            zIndex: 20,
          }),
        }}
        selectedOptionStyle="check"
      />

      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}
