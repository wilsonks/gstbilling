package com.wilsonks.gstbilling.platform.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformBillingOverviewDto {
    private BillingSummaryDto summary;
    private List<BillingPlanSummaryDto> plans;
    private List<RecentSubscriptionInvoiceDto> recentInvoices;
    private List<TenantBillingRowDto> tenants;
    private List<RenewalWatchTenantDto> renewalWatchlist;
}