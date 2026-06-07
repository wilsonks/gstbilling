package com.wilsonks.gstbilling.bulk.excel;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.*;
import java.util.function.Supplier;

@Component
@RequiredArgsConstructor
public class ExcelReader {

    private final ExcelHeaderValidator headerValidator;
    private final ExcelRowMapper rowMapper;

    public <T> ExcelReadResult<T> read(InputStream stream, Supplier<T> supplier, List<ExcelColumn> columns) {

        try (XSSFWorkbook workbook = new XSSFWorkbook(stream)) {

            Sheet sheet = workbook.getSheetAt(0);

            headerValidator.validateHeaders(sheet, columns);

            Map<Integer, ExcelColumn> mapping = headerValidator.buildMapping(sheet, columns);

            List<ExcelReadRow<T>> rows = new ArrayList<>();

            List<ExcelRowError> errors = new ArrayList<>(); // All errors across rows

            int totalRows = 0;

            //Row Loop
            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {

                int excelRowNumber = rowIndex + 1;

                Row row = sheet.getRow(rowIndex);

                if (isEmptyRow(row)) {
                    continue;
                }

                totalRows++;

                T dto = supplier.get();

                List<ExcelRowError> rowErrors = new ArrayList<>();

                Map<String, Object> rawValues = new LinkedHashMap<>();

                for (Map.Entry<Integer, ExcelColumn> entry : mapping.entrySet()) {

                    Integer cellIndex = entry.getKey();

                    ExcelColumn column = entry.getValue();

                    Object cellValue = CellUtils.getCellValue(row.getCell(cellIndex));

                    rawValues.put(column.getHeader(), cellValue);
                }

                //A Row<->DTO mapping building
                Optional<T> mapped = rowMapper.mapRow(row, excelRowNumber, dto, mapping, rowErrors);

                errors.addAll(rowErrors);

                rows.add(new ExcelReadRow<>(excelRowNumber, mapped.orElse(null), rawValues, rowErrors));
            }

            int validRows = (int) rows.stream().filter(r -> r.errors().isEmpty()).count();
            int invalidRows = (int) errors.stream().map(ExcelRowError::rowNumber).distinct().count();

            return new ExcelReadResult<>(rows, errors, totalRows, validRows, invalidRows);

        } catch (Exception ex) {

            throw new IllegalStateException("Failed reading workbook", ex);
        }
    }

    private boolean isEmptyRow(Row row) {

        if (row == null) {
            return true;
        }

        for (int i = row.getFirstCellNum();
             i < row.getLastCellNum();
             i++) {

            String value =
                    CellUtils.getCellValue(
                            row.getCell(i));

            if (value != null &&
                    !value.isBlank()) {
                return false;
            }
        }

        return true;
    }
}