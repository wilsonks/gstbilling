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
public class RecentSubscriptionInvoiceDto {
    private String invoiceNo;
    private Long tenantId;
    private String tenantName;

    private BigDecimal amount;
    private BigDecimal gstAmount;

    private LocalDate issuedOn;
    private LocalDate dueOn;

    private String status;
}