package com.wilsonks.gstbilling.invoice.sequence.imports;

import com.wilsonks.gstbilling.invoice.sequence.DocumentType;
import com.wilsonks.gstbilling.invoice.sequence.SequenceResetPolicy;
import lombok.Data;

@Data
public class InvoiceSequenceExportRow {

    private Long id;

    private String companyName;

    private DocumentType documentType;

    private String financialYear;

    private String prefix;

    private String suffix;

    private Integer paddingLength;

    private Long currentNumber;

    private SequenceResetPolicy resetPolicy;

    private Boolean active;
}