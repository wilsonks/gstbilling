package com.wilsonks.gstbilling.bulk.excel;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
public class ExcelTemplateBuilder {

    public byte[] buildTemplate(String sheetName, List<ExcelColumn> columns) {


        try (Workbook workbook = new XSSFWorkbook()) {


            Sheet dataSheet = workbook.createSheet(sheetName);

            Sheet instructionSheet = workbook.createSheet("Instructions");

            createDataSheet(workbook, dataSheet, columns);

            createInstructionSheet(workbook, instructionSheet, columns);

            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

                workbook.write(outputStream);

                return outputStream.toByteArray();
            }

        } catch (IOException ex) {

            log.error("Failed generating template", ex);

            throw new IllegalStateException("Failed generating Excel template", ex);
        }
    }


    private void createDataSheet(Workbook workbook, Sheet sheet, List<ExcelColumn> columns) {


        CellStyle normalHeaderStyle = createHeaderStyle(workbook);

        CellStyle requiredHeaderStyle = createRequiredHeaderStyle(workbook);

        Row headerRow = sheet.createRow(0);
        Row exampleRow = sheet.createRow(1);

        for (int i = 0; i < columns.size(); i++) {

            ExcelColumn column = columns.get(i);

            Cell cell = headerRow.createCell(i);

            String displayHeader = column.isRequired() ? "* " + column.getHeader() : column.getHeader();

            cell.setCellValue(displayHeader);

            cell.setCellStyle(column.isRequired() ? requiredHeaderStyle : normalHeaderStyle);

            if (column.isHidden()) {

                sheet.setColumnHidden(i, true);
            }

            int width = column.getWidth() != null ? column.getWidth() : 7000;

            sheet.setColumnWidth(i, width);
        }

        for (int i = 0; i < columns.size(); i++) {

            ExcelColumn column = columns.get(i);

            if (column.getExample() != null) {

                exampleRow.createCell(i).setCellValue(column.getExample());
            }
        }
        sheet.createFreezePane(0, 1);

        sheet.setAutoFilter(new CellRangeAddress(0, 0, 0, columns.size() - 1));
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

    private CellStyle createRequiredHeaderStyle(Workbook workbook) {

        Font font = workbook.createFont();

        font.setBold(true);

        font.setColor(IndexedColors.WHITE.getIndex());

        CellStyle style = workbook.createCellStyle();

        style.setFont(font);

        style.setFillForegroundColor(IndexedColors.RED.getIndex());

        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        style.setAlignment(HorizontalAlignment.CENTER);

        return style;
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