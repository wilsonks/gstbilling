package com.wilsonks.gstbilling.invoice;

import java.util.List;

public record InvoiceStats(
        long total,
        List<InvoiceDto> recentInvoices
) {
}