import React, { useState } from "react";
import { Select, useToast } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { setSelected } from "./companySlice";
import { setCompanyContext, setCredentials, logout } from "../auth/authSlice";
import { switchCompany } from "../auth/authApi";

export default function CompanySwitcher() {
  const dispatch = useDispatch();
  const toast = useToast();

  const companies = useSelector((state) => state.company.companies);
  const selected = useSelector((state) => state.company.selected);
  const auth = useSelector((state) => state.auth);

  const [switching, setSwitching] = useState(false);

  const handleChange = async (e) => {
    const companyId = e.target.value ? Number(e.target.value) : null;
    const selectedCompany = companies.find((c) => Number(c.id) === companyId);

    if (!companyId || companyId === selected) {
      return;
    }

    setSwitching(true);
    try {
      const result = await switchCompany(companyId);

      dispatch(
        setCredentials({
          accessToken: result.accessToken,
          refreshToken: auth.refreshToken ?? null,
          user: result.user ?? auth.user ?? null,
          scope: result.scope ?? auth.scope ?? "TENANT",
          role: result.role ?? selectedCompany?.role ?? null,
          companyId: result.companyId ?? companyId,
        }),
      );

      dispatch(setSelected({ companyId }));
      dispatch(
        setCompanyContext({
          companyId: result.companyId ?? companyId,
          role: result.role ?? selectedCompany?.role ?? null,
        }),
      );

      toast({
        title: "Company switched",
        description: `Now working in ${selectedCompany?.name || "selected company"}.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to switch company.";

      if (error?.response?.status === 401) {
        dispatch(logout());
      }

      toast({
        title: "Company switch failed",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSwitching(false);
    }
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
      isDisabled={switching}
    >
      {companies.map((company) => (
        <option key={company.id} value={company.id}>
          {company.name}
        </option>
      ))}
    </Select>
  );
}
