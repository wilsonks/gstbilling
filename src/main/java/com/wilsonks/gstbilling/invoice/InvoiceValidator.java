package com.wilsonks.gstbilling.invoice;

import com.wilsonks.gstbilling.invoice.sequence.DocumentType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class InvoiceValidator {

    public void validateForCreate(CreateInvoiceRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Invoice payload is required");
        }

        DocumentType documentType = request.getDocumentType() != null
                ? request.getDocumentType()
                : DocumentType.TAX_INVOICE;

        if (request.getCustomerId() == null) {
            throw new IllegalArgumentException("Customer is required");
        }

        if (request.getInvoiceDate() == null) {
            throw new IllegalArgumentException("Invoice date is required");
        }

        if ((documentType == DocumentType.CREDIT_NOTE || documentType == DocumentType.DEBIT_NOTE)
                && request.getReferenceInvoiceId() == null) {
            throw new IllegalArgumentException("Reference invoice is required for credit note and debit note");
        }

        if ((documentType == DocumentType.TAX_INVOICE || documentType == DocumentType.PROFORMA_INVOICE)
                && request.getReferenceInvoiceId() != null) {
            throw new IllegalArgumentException("Reference invoice is not allowed for tax invoice or proforma invoice");
        }

        if (documentType != DocumentType.PROFORMA_INVOICE && request.getValidUntil() != null) {
            throw new IllegalArgumentException("Valid until is only allowed for proforma invoice");
        }

        if (documentType == DocumentType.PROFORMA_INVOICE && request.getSourceProformaId() != null) {
            throw new IllegalArgumentException("Proforma invoice cannot reference a source proforma");
        }

        if (documentType != DocumentType.TAX_INVOICE && request.getSourceProformaId() != null) {
            throw new IllegalArgumentException("Source proforma is only allowed for tax invoice");
        }

        if (request.getLines() == null || request.getLines().isEmpty()) {
            throw new IllegalArgumentException("At least one invoice line is required");
        }

        int lineNo = 1;
        for (CreateInvoiceLineRequest line : request.getLines()) {
            if (line.getProductId() == null) {
                throw new IllegalArgumentException("Product is required on line " + lineNo);
            }

            if (line.getQuantity() == null || line.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than 0 on line " + lineNo);
            }

            if (line.getUnitPrice() == null || line.getUnitPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Unit price cannot be negative on line " + lineNo);
            }

            lineNo++;
        }
    }
}