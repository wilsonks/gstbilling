package com.wilsonks.gstbilling.dashboard.dto;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record DashboardSummaryResponse(

        long companyCount,
        long activeCompanyCount,

        long customerCount,
        long activeCustomerCount,

        long productCount,
        long activeProductCount,

        long invoiceSequenceCount,

        long taxInvoiceCount,
        long proformaInvoiceCount,
        long creditNoteCount,
        long debitNoteCount,

        BigDecimal taxInvoiceValue,
        BigDecimal proformaInvoiceValue,
        BigDecimal creditNoteValue,
        BigDecimal debitNoteValue,

        BigDecimal netRevenue,
        BigDecimal monthlyRevenue,

        BigDecimal averageInvoiceValue

) {
}