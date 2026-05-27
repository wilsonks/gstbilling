package com.wilsonks.gstbilling.platform.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingSummaryDto {
    private long totalTenants;
    private long activeSubscriptions;
    private long overdueTenants;
    private long suspendedTenants;

    private BigDecimal mrr;
    private BigDecimal arr;

    private BigDecimal billedThisMonth;
    private BigDecimal collectedThisMonth;
    private BigDecimal outstandingAmount;

    private BigDecimal gstCollectedThisMonth;
}