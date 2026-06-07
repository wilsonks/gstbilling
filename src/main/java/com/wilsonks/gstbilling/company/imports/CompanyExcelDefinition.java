package com.wilsonks.gstbilling.company.imports;


import com.wilsonks.gstbilling.bulk.excel.ExcelColumn;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CompanyExcelDefinition {

    public List<ExcelColumn> columns() {

        return List.of(

                ExcelColumn.builder()
                        .header("ID")
                        .fieldName("id")
                        .dataType(Long.class)
                        .hidden(true)
                        .build(),

                ExcelColumn.builder()
                        .header("NAME")
                        .fieldName("name")
                        .required(true)
                        .dataType(String.class)
                        .example("ABC Technologies")
                        .build(),

                ExcelColumn.builder()
                        .header("LEGAL_NAME")
                        .fieldName("legalName")
                        .dataType(String.class)
                        .example("ABC Technologies Private Limited")
                        .build(),

                ExcelColumn.builder()
                        .header("TRADE_NAME")
                        .fieldName("tradeName")
                        .dataType(String.class)
                        .example("ABC Tech")
                        .build(),

                ExcelColumn.builder()
                        .header("GSTIN")
                        .fieldName("gstin")
                        .required(true)
                        .dataType(String.class)
                        .example("29ABCDE1234F1Z5")
                        .build(),

                ExcelColumn.builder()
                        .header("EMAIL")
                        .fieldName("email")
                        .dataType(String.class)
                        .example("admin@abctech.com")
                        .build(),

                ExcelColumn.builder()
                        .header("PHONE")
                        .fieldName("phone")
                        .dataType(String.class)
                        .example("9876543210")
                        .build(),

                ExcelColumn.builder()
                        .header("ADDRESS_LINE1")
                        .fieldName("addressLine1")
                        .dataType(String.class)
                        .build(),

                ExcelColumn.builder()
                        .header("ADDRESS_LINE2")
                        .fieldName("addressLine2")
                        .dataType(String.class)
                        .build(),

                ExcelColumn.builder()
                        .header("CITY")
                        .fieldName("city")
                        .dataType(String.class)
                        .build(),

                ExcelColumn.builder()
                        .header("STATE")
                        .fieldName("state")
                        .dataType(String.class)
                        .build(),

                ExcelColumn.builder()
                        .header("PINCODE")
                        .fieldName("pincode")
                        .dataType(String.class)
                        .build(),

                ExcelColumn.builder()
                        .header("COUNTRY")
                        .fieldName("country")
                        .dataType(String.class)
                        .example("India")
                        .build(),

                ExcelColumn.builder()
                        .header("TYPE")
                        .fieldName("type")
                        .required(true)
                        .dataType(String.class)
                        .example("PRIVATE_LIMITED")
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