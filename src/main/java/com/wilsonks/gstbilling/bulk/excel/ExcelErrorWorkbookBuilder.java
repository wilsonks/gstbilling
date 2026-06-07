package com.wilsonks.gstbilling.bulk.excel;

import com.wilsonks.gstbilling.bulk.excel.ExcelColumn;
import com.wilsonks.gstbilling.bulk.excel.ExcelRowError;
import com.wilsonks.gstbilling.bulk.imports.ImportRowResult;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Component
public class ExcelErrorWorkbookBuilder {

    public <T> byte[] buildErrorWorkbook(List<ExcelColumn> columns, List<ImportRowResult<T>> rows, List<ExcelRowError> errors) {

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {

            buildErrorsSheet(workbook, errors);

            buildFailedRowsSheet(workbook, columns, rows);

            buildInstructionsSheet(workbook);

            try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {

                workbook.write(output);

                return output.toByteArray();
            }

        } catch (Exception ex) {

            throw new IllegalStateException("Failed generating error workbook", ex);
        }
    }

    private void buildErrorsSheet(Workbook workbook, List<ExcelRowError> errors) {

        Sheet sheet = workbook.createSheet("Errors");

        Row header = sheet.createRow(0);

        header.createCell(0).setCellValue("Row");

        header.createCell(1).setCellValue("Column");

        header.createCell(2).setCellValue("Value");

        header.createCell(3).setCellValue("Error");

        int rowIndex = 1;

        for (ExcelRowError error : errors) {

            Row row = sheet.createRow(rowIndex++);

            row.createCell(0).setCellValue(error.rowNumber());

            row.createCell(1).setCellValue(Objects.toString(error.column(), ""));

            row.createCell(2).setCellValue(Objects.toString(error.value(), ""));

            row.createCell(3).setCellValue(Objects.toString(error.message(), ""));
        }

        autoSize(sheet, 4);
    }

    private <T> void buildFailedRowsSheet(Workbook workbook, List<ExcelColumn> columns, List<ImportRowResult<T>> rows) {

        Sheet sheet = workbook.createSheet("Failed Rows");

        Row header = sheet.createRow(0);

        int col = 0;

        for (ExcelColumn column : columns) {

            header.createCell(col++).setCellValue(column.getHeader());
        }

        header.createCell(col).setCellValue("ERROR");

        int rowIndex = 1;

        for (ImportRowResult<T> rowResult : rows) {

            if (rowResult.valid()) {
                continue;
            }

            Row row = sheet.createRow(rowIndex++);

            int dataCol = 0;

            Map<String, Object> rawValues = rowResult.rawValues();

            for (ExcelColumn column : columns) {

                Object value = rawValues.get(column.getHeader());

                row.createCell(dataCol++).setCellValue(Objects.toString(value, ""));
            }

            row.createCell(dataCol).setCellValue(String.join("; ", rowResult.errors()));
        }

        autoSize(sheet, columns.size() + 1);
    }

    private void buildInstructionsSheet(Workbook workbook) {

        Sheet sheet = workbook.createSheet("Instructions");

        sheet.createRow(0).createCell(0).setCellValue("Fix rows in the 'Failed Rows' sheet.");

        sheet.createRow(1).createCell(0).setCellValue("Do not modify column headers.");

        sheet.createRow(2).createCell(0).setCellValue("Remove the ERROR column before re-uploading.");

        sheet.createRow(3).createCell(0).setCellValue("Copy corrected rows back into the original template.");

        sheet.createRow(4).createCell(0).setCellValue("Upload the corrected file again.");
    }

    private void autoSize(Sheet sheet, int columns) {

        for (int i = 0; i < columns; i++) {

            sheet.autoSizeColumn(i);
        }
    }
}