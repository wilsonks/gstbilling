package com.wilsonks.gstbilling.bulk.excel;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExcelWriter {

    private final ExcelReflectionMapper reflectionMapper;

    public <T> byte[] write(String sheetName, List<T> rows, List<ExcelColumn> columns) {

        try (Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet(sheetName);

            CellStyle headerStyle = createHeaderStyle(workbook);

            createHeaderRow(sheet, columns, headerStyle);

            populateRows(sheet, rows, columns);

            applySheetConfiguration(sheet, columns);

            Sheet instructionSheet = workbook.createSheet("Instructions");

            createInstructionSheet(workbook, instructionSheet, columns);


            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

                workbook.write(outputStream);

                return outputStream.toByteArray();
            }

        } catch (IOException ex) {

            throw new IllegalStateException("Failed generating workbook", ex);
        }
    }

    private void createHeaderRow(Sheet sheet, List<ExcelColumn> columns, CellStyle headerStyle) {

        Row headerRow = sheet.createRow(0);

        for (int i = 0; i < columns.size(); i++) {

            ExcelColumn column = columns.get(i);

            Cell cell = headerRow.createCell(i);

            cell.setCellValue(column.getHeader());

            cell.setCellStyle(headerStyle);
        }
    }

    private <T> void populateRows(Sheet sheet, List<T> rows, List<ExcelColumn> columns) {

        int rowIndex = 1;

        for (T dto : rows) {

            Row row = sheet.createRow(rowIndex++);

            for (int columnIndex = 0; columnIndex < columns.size(); columnIndex++) {

                ExcelColumn column = columns.get(columnIndex);

                Object value = reflectionMapper.getFieldValue(dto, column.getFieldName());

                Cell cell = row.createCell(columnIndex);

                writeCellValue(cell, value);
            }
        }
    }

    private void writeCellValue(Cell cell, Object value) {

        if (value == null) {
            return;
        }

        if (value instanceof String s) {

            cell.setCellValue(s);
            return;
        }

        if (value instanceof Integer i) {

            cell.setCellValue(i);
            return;
        }

        if (value instanceof Long l) {

            cell.setCellValue(l);
            return;
        }

        if (value instanceof Double d) {

            cell.setCellValue(d);
            return;
        }

        if (value instanceof Boolean b) {

            cell.setCellValue(b);
            return;
        }

        if (value instanceof BigDecimal bd) {

            cell.setCellValue(bd.doubleValue());

            return;
        }

        if (value instanceof Enum<?> e) {

            cell.setCellValue(e.name());

            return;
        }

        cell.setCellValue(String.valueOf(value));
    }

    private void applySheetConfiguration(Sheet sheet, List<ExcelColumn> columns) {

        for (int i = 0; i < columns.size(); i++) {

            ExcelColumn column = columns.get(i);

            if (column.isHidden()) {

                sheet.setColumnHidden(i, true);
            }

            int width = column.getWidth() != null ? column.getWidth() : 7000;

            sheet.setColumnWidth(i, width);
        }

        sheet.createFreezePane(0, 1);

        if (!columns.isEmpty()) {

            sheet.setAutoFilter(new CellRangeAddress(0, 0, 0, columns.size() - 1));
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {

        Font font = workbook.createFont();

        font.setBold(true);

        CellStyle style = workbook.createCellStyle();

        style.setFont(font);

        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());

        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        style.setBorderBottom(BorderStyle.THIN);

        style.setBorderTop(BorderStyle.THIN);

        style.setBorderLeft(BorderStyle.THIN);

        style.setBorderRight(BorderStyle.THIN);

        style.setAlignment(HorizontalAlignment.CENTER);

        style.setVerticalAlignment(VerticalAlignment.CENTER);

        return style;
    }

    private void createInstructionSheet(Workbook workbook, Sheet sheet, List<ExcelColumn> columns) {

        CellStyle headerStyle = createHeaderStyle(workbook);

        Row intro = sheet.createRow(0);

        intro.createCell(0).setCellValue("""
                Instructions:
                1. Do not modify column headers.
                2. Leave hidden ID values unchanged for updates.
                3. Leave ID blank to create new records.
                4. Correct validation errors before import.
                """);

        int startRow = 2;

        Row header = sheet.createRow(startRow);

        createStyledCell(header, 0, "Column", headerStyle);

        createStyledCell(header, 1, "Required", headerStyle);

        createStyledCell(header, 2, "Allowed Values / Data Type", headerStyle);

        createStyledCell(header, 3, "Description", headerStyle);

        createStyledCell(header, 4, "Example", headerStyle);

        int rowIndex = startRow + 1;

        for (ExcelColumn column : columns) {

            Row row = sheet.createRow(rowIndex++);

            row.createCell(0).setCellValue(safe(column.getHeader()));

            row.createCell(1).setCellValue(column.isRequired());

            row.createCell(2).setCellValue(resolveDataType(column.getDataType()));

            row.createCell(3).setCellValue(safe(column.getDescription()));

            row.createCell(4).setCellValue(safe(column.getExample()));
        }

        for (int i = 0; i < 5; i++) {

            sheet.autoSizeColumn(i);
        }

        sheet.createFreezePane(0, startRow + 1);
    }

    private void createStyledCell(Row row, int columnIndex, String value, CellStyle style) {

        Cell cell = row.createCell(columnIndex);

        cell.setCellValue(value);

        cell.setCellStyle(style);
    }


    private String resolveDataType(Class<?> type) {

        if (type == null) {
            return "";
        }

        if (type.isEnum()) {

            return String.join(", ", Arrays.stream(type.getEnumConstants()).map(Object::toString).toList());
        }

        return type.getSimpleName();
    }

    private String safe(String value) {

        return value == null ? "" : value;
    }

}