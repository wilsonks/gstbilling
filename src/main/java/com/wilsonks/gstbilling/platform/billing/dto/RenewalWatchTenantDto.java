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
public class RenewalWatchTenantDto {
    private Long tenantId;
    private String tenantName;

    private String subscriptionStatus;
    private String paymentStatus;

    private LocalDate nextRenewalDate;
    private BigDecimal outstanding;
}