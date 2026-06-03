package com.wilsonks.gstbilling.invoice;

import com.wilsonks.gstbilling.invoice.sequence.DocumentType;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateInvoiceRequest {
    private Long customerId;
    private DocumentType documentType;
    private Long referenceInvoiceId;
    private Long sourceProformaId;
    private LocalDate invoiceDate;
    private LocalDate validUntil;
    private String notes;
    private String termsAndConditions;
    private List<CreateInvoiceLineRequest> lines;
}