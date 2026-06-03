package com.wilsonks.gstbilling.bulk.excel;


public record ExcelRowError(

        int rowNumber,

        String column,

        String value,

        String message
) {
}