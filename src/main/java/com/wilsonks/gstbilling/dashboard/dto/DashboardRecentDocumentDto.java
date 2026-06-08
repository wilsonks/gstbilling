package com.wilsonks.gstbilling.dashboard.dto;

import com.wilsonks.gstbilling.invoice.InvoiceStatus;
import com.wilsonks.gstbilling.invoice.sequence.DocumentType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DashboardRecentDocumentDto(

        Long id,

        String documentNumber,

        DocumentType documentType,

        InvoiceStatus status,

        String customerName,

        LocalDate documentDate,

        BigDecimal amount

) {
}