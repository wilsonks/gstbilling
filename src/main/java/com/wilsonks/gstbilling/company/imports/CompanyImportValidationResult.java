package com.wilsonks.gstbilling.company.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelRowError;
import com.wilsonks.gstbilling.bulk.imports.ImportRowResult;

import java.util.List;

public record CompanyImportValidationResult(

        boolean valid,

        int totalRows,

        int validRows,

        int invalidRows,

        List<ImportRowResult<CompanyImportDto>> rows,

        List<ExcelRowError> errors
) {
}
