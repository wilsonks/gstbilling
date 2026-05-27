package com.wilsonks.gstbilling.platform.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantBillingRowDto {
    private Long tenantId;
    private String tenantName;
    private String gstin;
    private String contactEmail;

    private String plan;
    private String billingCycle;

    private String subscriptionStatus;
    private String paymentStatus;

    private BigDecimal mrr;
    private BigDecimal arr;
    private BigDecimal billedThisCycle;
    private BigDecimal outstanding;

    private Integer gstRate;

    private long companies;
    private long users;

    private LocalDate lastPaymentDate;
    private LocalDate nextRenewalDate;
}