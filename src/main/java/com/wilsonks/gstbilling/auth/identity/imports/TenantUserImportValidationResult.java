package com.wilsonks.gstbilling.auth.identity.imports;


import com.wilsonks.gstbilling.bulk.excel.ExcelRowError;
import com.wilsonks.gstbilling.bulk.imports.ImportRowResult;

import java.util.List;

public record TenantUserImportValidationResult(

        boolean valid,

        int totalRows,

        int validRows,

        int invalidRows,

        List<ImportRowResult<TenantUserImportDto>> rows,

        List<ExcelRowError> errors
) {
}