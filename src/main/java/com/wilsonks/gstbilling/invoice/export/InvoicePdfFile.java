package com.wilsonks.gstbilling.invoice.export;

public record InvoicePdfFile(
        String fileName,
        byte[] content
) {
}