package com.wilsonks.gstbilling.invoice.sequence.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelColumn;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class InvoiceSequenceExcelDefinition {

    public List<ExcelColumn> columns() {

        return List.of(

                ExcelColumn.builder().header("ID").fieldName("id").hidden(true).dataType(Long.class).build(),

                ExcelColumn.builder().header("COMPANY_NAME").fieldName("companyName").required(true).dataType(String.class).example("ABC Technologies").build(),

                ExcelColumn.builder().header("DOCUMENT_TYPE").fieldName("documentType").required(true).dataType(String.class).example("TAX_INVOICE").build(),

                ExcelColumn.builder().header("FINANCIAL_YEAR").fieldName("financialYear").required(true).dataType(String.class).example("2025-26").build(),

                ExcelColumn.builder().header("PREFIX").fieldName("prefix").required(true).dataType(String.class).example("INV/").build(),

                ExcelColumn.builder().header("SUFFIX").fieldName("suffix").dataType(String.class).example("").build(),

                ExcelColumn.builder().header("PADDING_LENGTH").fieldName("paddingLength").required(true).dataType(Integer.class).example("5").build(),

                ExcelColumn.builder().header("CURRENT_NUMBER").fieldName("currentNumber").required(true).dataType(Long.class).example("100").build(),

                ExcelColumn.builder().header("RESET_POLICY").fieldName("resetPolicy").required(true).dataType(String.class).example("FINANCIAL_YEAR").build(),

                ExcelColumn.builder().header("ACTIVE").fieldName("active").dataType(Boolean.class).example("TRUE").build());
    }
}