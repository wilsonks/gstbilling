package com.wilsonks.gstbilling.invoice.sequence;

import lombok.Data;

import java.time.Instant;

@Data
public class InvoiceSequenceDto {
    private Long id;
    private Long tenantId;
    private Long companyId;

    private DocumentType documentType;
    private String financialYear;

    private String prefix;
    private String suffix;
    private Integer paddingLength;
    private Long currentNumber;
    private SequenceResetPolicy resetPolicy;
    private Boolean active;

    private String preview;

    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;
    private Long version;
}