package com.wilsonks.gstbilling.invoice.sequence.imports;

import org.springframework.stereotype.Component;

@Component
public class InvoiceSequenceDuplicateKeyProvider {

    public String duplicateKey(InvoiceSequenceImportDto dto) {

        return dto.getCompanyName() + "|" + dto.getDocumentType() + "|" + dto.getFinancialYear();
    }
}