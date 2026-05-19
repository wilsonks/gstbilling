import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";

import {
  useLocation,
  Link as RouterLink,
} from "react-router-dom";

export default function Breadcrumbs() {
  const location = useLocation();

  const parts = location.pathname
    .split("/")
    .filter(Boolean);

  let path = "";

  return (
    <Breadcrumb mb={4} fontSize="sm">
      <BreadcrumbItem>
        <BreadcrumbLink as={RouterLink} to="/">
          Home
        </BreadcrumbLink>
      </BreadcrumbItem>

      {parts.map((part, index) => {
        path += `/${part}`;

        const isLast = index === parts.length - 1;

        const label =
          part === "admin"
            ? "Admin"
            : part === "tenants"
            ? "Tenants"
            : part;

        return (
          <BreadcrumbItem
            key={path}
            isCurrentPage={isLast}
          >
            <BreadcrumbLink
              as={RouterLink}
              to={path}
              pointerEvents={isLast ? "none" : "auto"}
              textTransform="capitalize"
            >
              {label}
            </BreadcrumbLink>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
}