package com.wilsonks.gstbilling.bulk.excel;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class ExcelHeaderValidator {

    public void validateHeaders(
            Sheet sheet,
            List<ExcelColumn> columns) {

        Row headerRow = sheet.getRow(0);

        if (headerRow == null) {

            throw new IllegalArgumentException(
                    "Header row is missing");
        }

        Set<String> actualHeaders =
                new HashSet<>();

        for (Cell cell : headerRow) {

            String header =
                    getString(cell);

            if (header != null) {

                actualHeaders.add(normalizeHeader(header));
            }
        }

        List<String> missing =
                columns.stream()
                        .map(ExcelColumn::getHeader)
                        .filter(h ->
                                !actualHeaders.contains(
                                        h.toUpperCase()))
                        .toList();

        if (!missing.isEmpty()) {

            throw new IllegalArgumentException(
                    "Missing required columns: "
                            + String.join(", ", missing));
        }
    }

    public Map<Integer, ExcelColumn> buildMapping(
            Sheet sheet,
            List<ExcelColumn> columns) {

        Map<String, ExcelColumn> defs =
                columns.stream()
                        .collect(Collectors.toMap(
                                c -> c.getHeader().toUpperCase(),
                                c -> c));

        Map<Integer, ExcelColumn> mapping =
                new LinkedHashMap<>();

        Row headerRow = sheet.getRow(0);

        for (Cell cell : headerRow) {

            String header =
                    getString(cell);

            if (header == null) {
                continue;
            }

            ExcelColumn column =
                    defs.get(normalizeHeader(header));

            if (column != null) {

                mapping.put(
                        cell.getColumnIndex(),
                        column);
            }
        }

        return mapping;
    }

    private String getString(Cell cell) {

        if (cell == null) {
            return null;
        }

        return cell.getStringCellValue();
    }

    private String normalizeHeader(
            String value) {

        if (value == null) {
            return null;
        }

        return value
                .replace("*", "")
                .trim()
                .toUpperCase();
    }
}