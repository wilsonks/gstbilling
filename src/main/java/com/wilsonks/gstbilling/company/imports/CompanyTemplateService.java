package com.wilsonks.gstbilling.company.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelTemplateBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompanyTemplateService {

    private final CompanyExcelDefinition excelDefinition;

    private final ExcelTemplateBuilder templateBuilder;

    public byte[] generateTemplate() {

        return templateBuilder.buildTemplate(
                "company-template.xlsx",
                excelDefinition.columns()
        );
    }
}