package com.wilsonks.gstbilling.bulk.excel;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ExcelRowMapper {

    private final ExcelReflectionMapper mapper;

    public <T> Optional<T> mapRow(
            Row row,
            int excelRowNumber,
            T dto,
            Map<Integer, ExcelColumn> mapping,
            List<ExcelRowError> errors) {

        boolean valid = true;

        for (Map.Entry<Integer, ExcelColumn> entry
                : mapping.entrySet()) {

            ExcelColumn column =
                    entry.getValue();

            Cell cell =
                    row.getCell(
                            entry.getKey(),
                            Row.MissingCellPolicy
                                    .RETURN_BLANK_AS_NULL);

            String value =
                    CellUtils.getCellValue(cell);

            if (column.isRequired() &&
                    (value == null ||
                            value.isBlank())) {

                errors.add(
                        new ExcelRowError(
                                excelRowNumber,
                                column.getHeader(),
                                value,
                                "Required field is missing"));

                valid = false;

                continue;
            }

            if (!validateEnum(
                    column,
                    value,
                    excelRowNumber,
                    errors)) {

                valid = false;

                continue;
            }

            mapper.setFieldValue(
                    dto,
                    column.getFieldName(),
                    value);
        }

        if (!valid) {

            return Optional.empty();
        }

        if (dto instanceof ExcelRowAware aware) {

            aware.setExcelRowNumber(
                    excelRowNumber);
        }

        return Optional.of(dto);
    }

    private boolean validateEnum(
            ExcelColumn column,
            String value,
            int rowNumber,
            List<ExcelRowError> errors) {

        if (value == null ||
                value.isBlank()) {

            return true;
        }

        Class<?> type =
                column.getDataType();

        if (type == null ||
                !type.isEnum()) {

            return true;
        }

        boolean valid =
                Arrays.stream(
                                type.getEnumConstants())
                        .map(Object::toString)
                        .anyMatch(v ->
                                v.equalsIgnoreCase(value));

        if (valid) {
            return true;
        }

        String allowed =
                Arrays.stream(
                                type.getEnumConstants())
                        .map(Object::toString)
                        .collect(Collectors.joining(", "));

        errors.add(
                new ExcelRowError(
                        rowNumber,
                        column.getHeader(),
                        value,
                        "Allowed values: "
                                + allowed));

        return false;
    }
}