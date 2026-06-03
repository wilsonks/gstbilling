package com.wilsonks.gstbilling.customer.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelTemplateBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerTemplateService {

    private final ExcelTemplateBuilder templateBuilder;

    private final CustomerExcelDefinition excelDefinition;

    public byte[] generateTemplate() {

        return templateBuilder.buildTemplate(
                "Customers",
                excelDefinition.columns());
    }
}