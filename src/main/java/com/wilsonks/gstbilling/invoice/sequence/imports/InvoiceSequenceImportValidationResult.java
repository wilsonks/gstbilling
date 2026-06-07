package com.wilsonks.gstbilling.invoice.sequence.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelRowError;
import com.wilsonks.gstbilling.bulk.imports.ImportRowResult;

import java.util.List;

public record InvoiceSequenceImportValidationResult(

        boolean valid,

        int totalRows,

        int validRows,

        int invalidRows,

        List<ImportRowResult<InvoiceSequenceImportDto>> rows,

        List<ExcelRowError> errors
) {
}