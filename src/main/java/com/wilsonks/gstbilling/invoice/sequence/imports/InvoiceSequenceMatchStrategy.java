package com.wilsonks.gstbilling.invoice.sequence.imports;


import com.wilsonks.gstbilling.context.TenantContext;
import com.wilsonks.gstbilling.invoice.sequence.InvoiceSequence;
import com.wilsonks.gstbilling.invoice.sequence.InvoiceSequenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class InvoiceSequenceMatchStrategy {

    private final InvoiceSequenceRepository repository;

    public Optional<InvoiceSequence> findMatch(InvoiceSequenceImportDto dto) {

        return repository.findByTenantIdAndCompanyIdAndDocumentTypeAndFinancialYear(TenantContext.get(), dto.getCompanyId(), dto.getDocumentType(), dto.getFinancialYear());
    }
}