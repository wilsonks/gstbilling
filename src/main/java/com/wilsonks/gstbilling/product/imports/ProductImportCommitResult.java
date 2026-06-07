package com.wilsonks.gstbilling.product.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelRowError;

import java.util.List;

public record ProductImportCommitResult(

        int totalRows,

        int inserted,

        int updated,

        int failed,

        List<ExcelRowError> errors
) {

    public boolean success() {

        return failed == 0;
    }

    public int processed() {

        return inserted + updated;
    }
}