package com.wilsonks.gstbilling.auth.identity.imports;


import com.wilsonks.gstbilling.bulk.excel.ExcelColumn;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TenantUserExcelDefinition {

    public List<ExcelColumn> columns() {

        return List.of(

                ExcelColumn.builder()
                        .header("USERNAME")
                        .fieldName("username")
                        .required(true)
                        .dataType(String.class)
                        .example("john.doe")
                        .build(),

                ExcelColumn.builder()
                        .header("EMAIL")
                        .fieldName("email")
                        .required(true)
                        .dataType(String.class)
                        .example("john@company.com")
                        .build(),

                ExcelColumn.builder()
                        .header("ROLES")
                        .fieldName("roles")
                        .required(true)
                        .dataType(String.class)
                        .example("ACCOUNTANT,MANAGER")
                        .build(),

                ExcelColumn.builder()
                        .header("ACTIVE")
                        .fieldName("active")
                        .dataType(Boolean.class)
                        .example("TRUE")
                        .build()
        );
    }
}