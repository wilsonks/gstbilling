package com.wilsonks.gstbilling.bulk.imports;

import java.util.List;

public record ImportRowResult<T>(

        int rowNumber,

        boolean valid,

        T data,

        List<String> errors
) {
}