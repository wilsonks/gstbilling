package com.wilsonks.gstbilling.invoice;

import com.wilsonks.gstbilling.invoice.sequence.DocumentType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
public class InvoiceDto {
    private Long id;
    private Long tenantId;
    private Long companyId;

    private DocumentType documentType;
    private Long referenceInvoiceId;
    private String referenceInvoiceNo;

    private Long sourceProformaId;
    private Long convertedToInvoiceId;
    private Instant convertedAt;
    private LocalDate validUntil;

    private String invoiceNo;
    private LocalDate invoiceDate;
    private LocalDate dueDate;

    private InvoiceStatus status;
    private TaxType taxType;
    private String placeOfSupplyStateCode;

    private String notes;
    private String termsAndConditions;

    private Long customerId;
    private String customerCode;
    private String customerLegalName;
    private String customerTradeName;
    private String customerGstin;

    private String customerBillingAddressLine1;
    private String customerBillingAddressLine2;
    private String customerBillingCity;
    private String customerBillingState;
    private String customerBillingStateCode;
    private String customerBillingPincode;
    private String customerBillingCountry;

    private String sellerLegalName;
    private String sellerGstin;
    private String sellerAddressLine1;
    private String sellerAddressLine2;
    private String sellerCity;
    private String sellerState;
    private String sellerStateCode;
    private String sellerPincode;
    private String sellerCountry;

    private BigDecimal totalTaxableAmount;
    private BigDecimal totalCgstAmount;
    private BigDecimal totalSgstAmount;
    private BigDecimal totalIgstAmount;
    private BigDecimal totalTaxAmount;
    private BigDecimal totalInvoiceAmount;

    private List<InvoiceLineDto> lines;

    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;
    private Long version;
}