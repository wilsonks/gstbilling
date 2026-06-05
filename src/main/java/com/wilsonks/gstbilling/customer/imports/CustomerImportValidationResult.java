package com.wilsonks.gstbilling.customer.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelRowError;
import com.wilsonks.gstbilling.bulk.imports.ImportRowResult;
import com.wilsonks.gstbilling.customer.CustomerDto;

import java.util.List;

public record CustomerImportValidationResult(

        boolean valid,

        int totalRows,

        int validRows,

        int invalidRows,

        List<ExcelRowError> errors,

        List<ImportRowResult<CustomerDto>> rows
) {
}