package com.wilsonks.gstbilling.product.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelRowError;
import com.wilsonks.gstbilling.bulk.imports.ImportRowResult;

import java.util.List;

public record ProductImportValidationResult(

        boolean valid,

        int totalRows,

        int validRows,

        int invalidRows,

        List<ImportRowResult<ProductImportDto>> rows,

        List<ExcelRowError> errors
) {
}