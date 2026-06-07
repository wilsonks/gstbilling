package com.wilsonks.gstbilling.bulk.excel;

import java.util.List;
import java.util.Map;

public record ExcelReadRow<T>(

        int rowNumber,

        T data,

        Map<String, Object> rawValues,

        List<ExcelRowError> errors
) {
}