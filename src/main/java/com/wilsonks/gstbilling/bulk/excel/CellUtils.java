package com.wilsonks.gstbilling.bulk.excel;

import org.apache.poi.ss.usermodel.Cell;

public final class CellUtils {

    private CellUtils() {
    }

    public static String getCellValue(
            Cell cell) {

        if (cell == null) {
            return null;
        }

        return switch (cell.getCellType()) {

            case STRING ->
                    cell.getStringCellValue();

            case NUMERIC -> {

                double value =
                        cell.getNumericCellValue();

                if (value == Math.floor(value)) {

                    yield String.valueOf(
                            (long) value);
                }

                yield String.valueOf(value);
            }

            case BOOLEAN ->
                    String.valueOf(
                            cell.getBooleanCellValue());

            case FORMULA -> {

                try {

                    yield cell.getStringCellValue();

                } catch (Exception ignored) {

                    yield String.valueOf(
                            cell.getNumericCellValue());
                }
            }

            case BLANK -> null;

            default -> null;
        };
    }
}