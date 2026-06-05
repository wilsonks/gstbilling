package com.wilsonks.gstbilling.bulk.excel;

import java.util.List;

public record ExcelReadRow<T>(

        int rowNumber,

        T data,

        List<ExcelRowError> errors
) {
}