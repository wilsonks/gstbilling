package com.wilsonks.gstbilling.invoice.sequence.imports;


import com.wilsonks.gstbilling.bulk.excel.ExcelRowError;

import java.util.List;

public record InvoiceSequenceImportCommitResult(

        int totalRows,

        int inserted,

        int updated,

        int failed,

        List<ExcelRowError> errors
) {
}