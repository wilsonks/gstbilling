package com.wilsonks.gstbilling.invoice.sequence;

import org.springframework.stereotype.Component;

@Component
public class InvoiceSequenceValidator {

    public void validateForCreateOrUpdate(InvoiceSequenceDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Invoice sequence payload is required");
        }

        if (dto.getCompanyId() == null) {
            throw new IllegalArgumentException("Company ID is required");
        }

        if (dto.getDocumentType() == null) {
            throw new IllegalArgumentException("Document type is required");
        }

        if (dto.getFinancialYear() == null || dto.getFinancialYear().isBlank()) {
            throw new IllegalArgumentException("Financial year is required");
        }

        if (dto.getPrefix() == null || dto.getPrefix().isBlank()) {
            throw new IllegalArgumentException("Prefix is required");
        }

        if (dto.getPaddingLength() == null || dto.getPaddingLength() < 1) {
            throw new IllegalArgumentException("Padding length must be at least 1");
        }

        if (dto.getCurrentNumber() == null || dto.getCurrentNumber() < 0) {
            throw new IllegalArgumentException("Current number cannot be negative");
        }

        if (dto.getResetPolicy() == null) {
            throw new IllegalArgumentException("Reset policy is required");
        }
    }
}