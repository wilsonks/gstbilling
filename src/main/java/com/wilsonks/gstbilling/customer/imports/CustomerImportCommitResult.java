package com.wilsonks.gstbilling.customer.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelRowError;

import java.util.List;

public record CustomerImportCommitResult(

        int totalRows,

        int inserted,

        int updated,

        int failed,

        List<ExcelRowError> errors
) {
}