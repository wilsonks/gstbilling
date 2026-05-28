package com.wilsonks.gstbilling.invoice.sequence;

import java.time.LocalDate;

public final class FinancialYearUtil {

    private FinancialYearUtil() {
    }

    public static String currentFinancialYear() {
        return forDate(LocalDate.now());
    }

    public static String forDate(LocalDate date) {
        int year = date.getYear();
        if (date.getMonthValue() >= 4) {
            return year + "-" + String.format("%02d", (year + 1) % 100);
        }
        return (year - 1) + "-" + String.format("%02d", year % 100);
    }
}