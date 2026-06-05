package com.wilsonks.gstbilling.bulk.excel;

import java.util.List;

public record ExcelReadResult<T>(

        List<ExcelReadRow<T>> rows,

        List<ExcelRowError> errors,

        int totalRows,

        int validRows,

        int invalidRows
) {
}