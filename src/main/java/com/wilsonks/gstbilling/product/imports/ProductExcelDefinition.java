package com.wilsonks.gstbilling.product.imports;


import com.wilsonks.gstbilling.bulk.excel.ExcelColumn;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProductExcelDefinition {

    public List<ExcelColumn> columns() {

        return List.of(

                ExcelColumn.builder()
                        .header("ID")
                        .fieldName("id")
                        .dataType(Long.class)
                        .hidden(true)
                        .build(),

                ExcelColumn.builder()
                        .header("CODE")
                        .fieldName("code")
                        .dataType(String.class)
                        .required(true)
                        .example("LAPTOP001")
                        .build(),

                ExcelColumn.builder()
                        .header("NAME")
                        .fieldName("name")
                        .dataType(String.class)
                        .required(true)
                        .example("Dell Latitude 5440")
                        .build(),

                ExcelColumn.builder()
                        .header("DESCRIPTION")
                        .fieldName("description")
                        .dataType(String.class)
                        .build(),

                ExcelColumn.builder()
                        .header("DEFAULT_PRICE")
                        .fieldName("defaultPrice")
                        .dataType(java.math.BigDecimal.class)
                        .required(true)
                        .example("45000")
                        .build(),

                ExcelColumn.builder()
                        .header("HSN_SAC_CODE")
                        .fieldName("hsnSacCode")
                        .dataType(String.class)
                        .required(true)
                        .example("847130")
                        .build(),

                ExcelColumn.builder()
                        .header("UNIT_CODE")
                        .fieldName("unitCode")
                        .dataType(String.class)
                        .required(true)
                        .example("NOS")
                        .build(),

                ExcelColumn.builder()
                        .header("GST_SLAB_CODE")
                        .fieldName("gstSlabCode")
                        .dataType(String.class)
                        .required(true)
                        .example("GST18")
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