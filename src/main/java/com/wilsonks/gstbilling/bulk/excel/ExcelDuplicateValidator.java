package com.wilsonks.gstbilling.bulk.excel;

import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class ExcelDuplicateValidator {

    public <T> List<ExcelRowError> validate(List<T> rows, DuplicateKeyProvider<T> provider) {

        List<ExcelRowError> errors = new ArrayList<>();

        Map<String, Integer> seen = new HashMap<>();

        for (T row : rows) {

            String key = provider.duplicateKey(row);

            if (key == null || key.isBlank()) {

                continue;
            }

            int excelRowNumber = row instanceof ExcelRowAware aware ? aware.getExcelRowNumber() : -1;

            Integer previous = seen.putIfAbsent(key.toUpperCase(), excelRowNumber);

            if (previous != null) {

                errors.add(new ExcelRowError(excelRowNumber, "KEY", key, "Duplicate value also exists in row " + previous));
            }
        }

        return errors;
    }
}