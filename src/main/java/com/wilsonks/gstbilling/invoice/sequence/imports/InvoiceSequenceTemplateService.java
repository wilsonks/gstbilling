package com.wilsonks.gstbilling.invoice.sequence.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelTemplateBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InvoiceSequenceTemplateService {

    private final InvoiceSequenceExcelDefinition excelDefinition;

    private final ExcelTemplateBuilder templateBuilder;

    public byte[] generateTemplate() {

        return templateBuilder.buildTemplate(
                "invoice-sequence-template.xlsx",
                excelDefinition.columns()
        );
    }
}