package com.wilsonks.gstbilling.bulk.excel;


public interface ExcelRowAware {

    void setExcelRowNumber(int rowNumber);

    int getExcelRowNumber();
}