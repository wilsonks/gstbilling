package com.wilsonks.gstbilling.bulk.excel;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;

@Component
@RequiredArgsConstructor
public class ExcelReader {

    private final ExcelHeaderValidator headerValidator;
    private final ExcelRowMapper rowMapper;

    public <T> ExcelReadResult<T> read(
            InputStream stream,
            Supplier<T> supplier,
            List<ExcelColumn> columns) {

        try (XSSFWorkbook workbook =
                     new XSSFWorkbook(stream)) {

            Sheet sheet =
                    workbook.getSheetAt(0);

            headerValidator.validateHeaders(
                    sheet,
                    columns);

            Map<Integer, ExcelColumn> mapping =
                    headerValidator.buildMapping(
                            sheet,
                            columns);


            List<ExcelReadRow<T>> rows =
                    new ArrayList<>();

            List<ExcelRowError> errors =
                    new ArrayList<>();

            int totalRows = 0;

            for (int rowIndex = 1;
                 rowIndex <= sheet.getLastRowNum();
                 rowIndex++) {

                Row row =
                        sheet.getRow(rowIndex);

                if (row == null || row.getPhysicalNumberOfCells() == 0) {
                    continue;
                }

                totalRows++;

                T dto = supplier.get();

                List<ExcelRowError> rowErrors =
                        new ArrayList<>();

                Optional<T> mapped =
                        rowMapper.mapRow(
                                row,
                                rowIndex + 1,
                                dto,
                                mapping,
                                rowErrors);

                errors.addAll(rowErrors);

                rows.add(
                        new ExcelReadRow<>(
                                rowIndex + 1,
                                mapped.orElse(null),
                                rowErrors
                        )
                );
            }

            int invalidRows =
                    (int) errors.stream()
                            .map(ExcelRowError::rowNumber)
                            .distinct()
                            .count();

            return new ExcelReadResult<>(
                    rows,
                    errors,
                    totalRows,
                    (int) rows.stream()
                            .filter(r -> r.errors().isEmpty())
                            .count(),
                    invalidRows
            );

        } catch (Exception ex) {

            throw new IllegalStateException(
                    "Failed reading workbook",
                    ex);
        }
    }
}