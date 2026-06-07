package com.wilsonks.gstbilling.product.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelTemplateBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductTemplateService {

    private final ProductExcelDefinition excelDefinition;

    private final ExcelTemplateBuilder templateBuilder;

    public byte[] generateTemplate() {

        return templateBuilder.buildTemplate(
                "products-template.xlsx",
                excelDefinition.columns());
    }
}
