package com.wilsonks.gstbilling.invoice.sequence.imports;

import com.wilsonks.gstbilling.context.TenantContext;
import com.wilsonks.gstbilling.invoice.sequence.InvoiceSequenceDto;
import com.wilsonks.gstbilling.invoice.sequence.InvoiceSequenceValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class InvoiceSequenceImportValidator {

    private final InvoiceSequenceValidator validator;

    public List<String> validate(InvoiceSequenceImportDto dto) {

        List<String> errors = new ArrayList<>();

        try {

            validator.validateForCreateOrUpdate(mapToDto(dto));

        } catch (Exception ex) {

            errors.add(ex.getMessage());
        }

        return errors;
    }

    private InvoiceSequenceDto mapToDto(InvoiceSequenceImportDto dto) {

        InvoiceSequenceDto target = new InvoiceSequenceDto();

        target.setId(dto.getId());

        target.setTenantId(TenantContext.get());

        target.setCompanyId(dto.getCompanyId());

        target.setDocumentType(dto.getDocumentType());

        target.setFinancialYear(dto.getFinancialYear());

        target.setPrefix(dto.getPrefix());

        target.setSuffix(dto.getSuffix());

        target.setPaddingLength(dto.getPaddingLength());

        target.setCurrentNumber(dto.getCurrentNumber());

        target.setResetPolicy(dto.getResetPolicy());

        target.setActive(dto.getActive());

        return target;
    }
}


