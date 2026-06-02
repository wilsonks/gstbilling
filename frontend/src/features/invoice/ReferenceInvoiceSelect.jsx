import React, { useEffect, useMemo, useState } from "react";
import { Select, Spinner, Text, VStack } from "@chakra-ui/react";
import { getInvoicesPage } from "./invoiceApi";

export default function ReferenceInvoiceSelect({
  value,
  onChange,
  isDisabled,
}) {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    let ignore = false;

    const loadInvoices = async () => {
      setLoading(true);
      try {
        const page = await getInvoicesPage({
          page: 0,
          size: 100,
        });

        if (ignore) return;

        const items = (page?.content || []).filter((invoice) => {
          if ((invoice.documentType || "TAX_INVOICE") !== "TAX_INVOICE") {
            return false;
          }

          if (invoice.status === "CANCELLED") {
            return false;
          }

          return true;
        });

        setInvoices(items);
      } catch (error) {
        if (!ignore) {
          setInvoices([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadInvoices();

    return () => {
      ignore = true;
    };
  }, []);

  const options = useMemo(() => invoices || [], [invoices]);

  return (
    <VStack align="stretch" spacing={2}>
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <Select
          placeholder="Select reference invoice"
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          isDisabled={isDisabled || loading}
        >
          {options.map((invoice) => (
            <option key={invoice.id} value={invoice.id}>
              {invoice.invoiceNo} — {invoice.customerLegalName} —{" "}
              {invoice.invoiceDate
                ? new Date(invoice.invoiceDate).toLocaleDateString()
                : ""}
            </option>
          ))}
        </Select>
      )}

      {!loading && options.length === 0 && (
        <Text fontSize="sm" color="gray.500">
          No eligible tax invoices found.
        </Text>
      )}
    </VStack>
  );
}
