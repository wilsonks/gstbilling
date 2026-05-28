package com.wilsonks.gstbilling.invoice;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateInvoiceRequest {
    private Long customerId;
    private LocalDate invoiceDate;
    private String notes;
    private String termsAndConditions;
    private List<CreateInvoiceLineRequest> lines;
}