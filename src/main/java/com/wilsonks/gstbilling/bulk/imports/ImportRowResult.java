package com.wilsonks.gstbilling.bulk.imports;

import java.util.List;
import java.util.Map;

public record ImportRowResult<T>(

        int rowNumber,

        boolean valid,

        T data,

        Map<String, Object> rawValues,

        List<String> errors
) {
}