import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Divider,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import api from "../../services/api";

function DetailItem({ label, value }) {
  return (
    <Box>
      <Text fontSize="sm" color="gray.500" mb={1}>
        {label}
      </Text>
      <Box fontWeight="500">{value ?? "—"}</Box>
    </Box>
  );
}

function getActionColorScheme(action) {
  const normalized = String(action || "").toUpperCase();

  if (normalized === "LOGIN_SUCCESS") return "green";
  if (normalized === "LOGIN_FAILED") return "red";
  if (normalized === "REGISTER_SUCCESS") return "teal";
  if (normalized === "REGISTER_FAILED") return "red";
  if (normalized === "REFRESH_SUCCESS") return "yellow";
  if (normalized === "REFRESH_FAILED") return "red";
  if (normalized === "SWITCH_COMPANY_SUCCESS") return "cyan";
  if (normalized === "SWITCH_COMPANY_FAILED") return "red";
  if (normalized === "LOGOUT_SUCCESS") return "gray";

  if (normalized.includes("SUCCESS")) return "green";
  if (normalized.includes("FAILED") || normalized.includes("FAIL"))
    return "red";
  if (normalized.includes("REGISTER")) return "teal";
  if (normalized.includes("REFRESH")) return "yellow";
  if (normalized.includes("SWITCH_COMPANY")) return "cyan";
  if (normalized.includes("LOGIN")) return "purple";

  return "gray";
}

function ActionBadge({ action }) {
  return (
    <Badge colorScheme={getActionColorScheme(action)}>{action || "—"}</Badge>
  );
}

function formatDateTime(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function AuditLogDetailsModal({ isOpen, onClose, auditId }) {
  const toast = useToast();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !auditId) {
      setAudit(null);
      return;
    }

    let active = true;

    const fetchAudit = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/platform/audit-logs/${auditId}`);
        if (!active) return;
        setAudit(res.data);
      } catch (error) {
        if (!active) return;
        setAudit(null);
        toast({
          title: "Failed to load audit log",
          description: error?.response?.data?.message || "Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAudit();

    return () => {
      active = false;
    };
  }, [isOpen, auditId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Audit Log Details</ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          {loading ? (
            <Box py={10} textAlign="center">
              <Spinner />
            </Box>
          ) : !audit ? (
            <Box py={6}>
              <Text fontWeight="600">Audit log not found</Text>
              <Text color="gray.500" mt={1}>
                The requested audit log could not be loaded.
              </Text>
            </Box>
          ) : (
            <Stack spacing={5}>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
                <GridItem>
                  <DetailItem label="Audit ID" value={audit.id} />
                </GridItem>
                <GridItem>
                  <DetailItem
                    label="Timestamp"
                    value={formatDateTime(audit.timestamp)}
                  />
                </GridItem>
                <GridItem>
                  <DetailItem label="Username" value={audit.username} />
                </GridItem>
                <GridItem>
                  <DetailItem
                    label="Action"
                    value={<ActionBadge action={audit.action} />}
                  />
                </GridItem>
                <GridItem>
                  <DetailItem
                    label="Company ID"
                    value={audit.companyId ?? "—"}
                  />
                </GridItem>
                <GridItem>
                  <DetailItem label="IP Address" value={audit.ip || "—"} />
                </GridItem>
              </Grid>

              <Divider />

              <Box>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Summary
                </Text>
                <Text>
                  User <strong>{audit.username || "—"}</strong> performed{" "}
                  <strong>{audit.action || "—"}</strong>
                  {audit.companyId ? ` for company #${audit.companyId}` : ""}
                  {audit.ip ? ` from IP ${audit.ip}` : ""} on{" "}
                  <strong>{formatDateTime(audit.timestamp)}</strong>.
                </Text>
              </Box>
            </Stack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
