import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  SimpleGrid,
  Stack,
  useToast,
} from "@chakra-ui/react";

import {
  RefreshCw,
  DollarSign,
  TrendingUp,
  Receipt,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getMyCompanies } from "../company/companyApi";
import { setCompanyList } from "../company/companySlice";

import {
  getDashboardAlerts,
  getDashboardSummary,
  getDashboardRecentDocuments,
} from "./dashboardApi";

import DashboardStatCard from "./DashboardStatCard";
import DashboardAlertCard from "./DashboardAlertCard";
import DashboardDocumentBreakdownCard from "./DashboardDocumentBreakdownCard";
import DashboardRecentDocuments from "./DashboardRecentDocuments";
import PageHeader from "../../layout/PageHeader";

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function TenantDashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dashboardSummary, setDashboardSummary] = useState({});
  const [dashboardAlerts, setDashboardAlerts] = useState({});
  const [recentDocuments, setRecentDocuments] = useState([]);

  const loadDashboard = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [
        companiesData,
        dashboardSummaryData,
        dashboardAlertsData,
        recentDocumentsData,
      ] = await Promise.all([
        getMyCompanies(),
        getDashboardSummary(),
        getDashboardAlerts(),
        getDashboardRecentDocuments(),
      ]);

      const nextCompanies = companiesData || [];

      dispatch(setCompanyList({ companies: nextCompanies }));

      setDashboardSummary(dashboardSummaryData || {});
      setDashboardAlerts(dashboardAlertsData || {});
      setRecentDocuments(recentDocumentsData || []);
    } catch (error) {
      toast({
        title: "Failed to load dashboard",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const hasAlerts =
    (dashboardAlerts.pendingProformaCount ?? 0) > 0 ||
    (dashboardAlerts.inactiveProductCount ?? 0) > 0 ||
    (dashboardAlerts.cancelledDocumentCount ?? 0) > 0;

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <Stack spacing={6}>
      <PageHeader
        title="Business Dashboard"
        subtitle="Revenue, document activity and operational insights for the selected company."
        actions={
          <Button
            leftIcon={<RefreshCw size={16} />}
            variant="outline"
            onClick={() => loadDashboard({ silent: true })}
            isLoading={refreshing}
          >
            Refresh
          </Button>
        }
      />

      <SimpleGrid
        columns={{
          base: 1,
          md: 2,
          xl: 4,
        }}
        spacing={4}
      >
        <DashboardStatCard
          label="Net Revenue"
          value={formatCurrency(dashboardSummary.netRevenue)}
          helpText="Revenue after adjustments"
          icon={<DollarSign size={18} />}
          loading={loading}
        />

        <DashboardStatCard
          label="Monthly Revenue"
          value={formatCurrency(dashboardSummary.monthlyRevenue)}
          helpText="Current month revenue"
          icon={<TrendingUp size={18} />}
          loading={loading}
        />

        <DashboardStatCard
          label="Average Invoice"
          value={formatCurrency(dashboardSummary.averageInvoiceValue)}
          helpText="Average tax invoice value"
          icon={<Receipt size={18} />}
          loading={loading}
        />

        <DashboardStatCard
          label="Tax Invoices"
          value={dashboardSummary.taxInvoiceCount ?? 0}
          helpText={`${formatCurrency(
            dashboardSummary.taxInvoiceValue,
          )} billed`}
          icon={<FileText size={18} />}
          loading={loading}
        />
      </SimpleGrid>

      <DashboardDocumentBreakdownCard
        summary={dashboardSummary}
        loading={loading}
      />

      <Box>
        <Heading size="md" mb={4}>
          Action Center
        </Heading>

        <SimpleGrid
          columns={{
            base: 1,
            md: 2,
            xl: 4,
          }}
          spacing={4}
        >
          {!hasAlerts && (
            <DashboardAlertCard
              title="System Health"
              value="Good"
              description="No active alerts"
              status="success"
            />
          )}
          {dashboardAlerts.pendingProformaCount > 0 && (
            <DashboardAlertCard
              title="Pending Proformas"
              value={dashboardAlerts.pendingProformaCount}
              description="Awaiting conversion"
              status="warning"
            />
          )}

          <DashboardAlertCard
            title="Conversion Rate"
            value={`${dashboardAlerts.proformaConversionRate ?? 0}%`}
            description={`${dashboardAlerts.convertedProformaCount ?? 0} converted`}
            status="info"
          />

          {dashboardAlerts.inactiveProductCount > 0 && (
            <DashboardAlertCard
              title="Inactive Products"
              value={dashboardAlerts.inactiveProductCount}
              description="Need review"
              status="warning"
            />
          )}

          {dashboardAlerts.cancelledDocumentCount > 0 && (
            <DashboardAlertCard
              title="Cancelled Documents"
              value={dashboardAlerts.cancelledDocumentCount}
              description="Business review required"
              status="warning"
            />
          )}
        </SimpleGrid>
      </Box>

      <DashboardRecentDocuments documents={recentDocuments} loading={loading} />

      <Card
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="xl"
        shadow="sm"
      >
        <CardBody>
          <Heading size="md" mb={4}>
            Quick Actions
          </Heading>

          <SimpleGrid
            columns={{
              base: 1,
              md: 2,
              xl: 4,
            }}
            spacing={3}
          >
            <Button
              colorScheme="blue"
              onClick={() => navigate("/invoices/new")}
            >
              Create Tax Invoice
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/proforma-invoices/new")}
            >
              Create Proforma
            </Button>

            <Button variant="outline" onClick={() => navigate("/customers")}>
              Manage Customers
            </Button>

            <Button variant="outline" onClick={() => navigate("/products")}>
              Manage Products
            </Button>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Stack>
  );
}
