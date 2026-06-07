package com.wilsonks.gstbilling.company.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelRowError;

import java.util.List;

public record CompanyImportCommitResult(

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
