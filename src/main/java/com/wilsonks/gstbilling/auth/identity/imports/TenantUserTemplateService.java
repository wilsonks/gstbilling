package com.wilsonks.gstbilling.auth.identity.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelTemplateBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TenantUserTemplateService {

    private final TenantUserExcelDefinition excelDefinition;

    private final ExcelTemplateBuilder templateBuilder;

    public byte[] generateTemplate() {

        return templateBuilder.buildTemplate(
                "users-template",
                excelDefinition.columns()
        );
    }
}