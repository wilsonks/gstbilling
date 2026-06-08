package com.wilsonks.gstbilling.dashboard.dto;


import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record DashboardAlertsResponse(

        long pendingProformaCount,

        long convertedProformaCount,

        BigDecimal proformaConversionRate,

        long draftDocumentCount,

        long cancelledDocumentCount,

        long inactiveCustomerCount,

        long inactiveProductCount

) {
}