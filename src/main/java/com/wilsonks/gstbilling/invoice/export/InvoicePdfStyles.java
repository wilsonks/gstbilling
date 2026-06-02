package com.wilsonks.gstbilling.invoice.export;

import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public final class InvoicePdfStyles {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DateTimeFormatter TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
    private static final DecimalFormat AMOUNT_FORMAT = new DecimalFormat("#,##0.00");

    private InvoicePdfStyles() {
    }

    public static Font brandFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
    }

    public static Font titleFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
    }

    public static Font subtitleFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9);
    }

    public static Font sectionFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
    }

    public static Font normalFont() {
        return FontFactory.getFont(FontFactory.HELVETICA, 10);
    }

    public static Font boldFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
    }

    public static Font smallFont() {
        return FontFactory.getFont(FontFactory.HELVETICA, 9);
    }

    public static Font footerFont() {
        return FontFactory.getFont(FontFactory.HELVETICA, 8);
    }

    public static DateTimeFormatter timestampFormat() {
        return TIMESTAMP_FORMAT;
    }

    public static PdfPCell infoCell(String label, String value) {
        Phrase phrase = new Phrase();
        phrase.add(new Phrase(label + ": ", boldFont()));
        phrase.add(new Phrase(value, normalFont()));

        PdfPCell cell = new PdfPCell(phrase);
        cell.setPadding(8f);
        cell.setBorder(Rectangle.BOX);
        return cell;
    }

    public static PdfPCell sectionTitleCell(String title, int colspan) {
        PdfPCell cell = new PdfPCell(new Phrase(title, sectionFont()));
        cell.setColspan(colspan);
        cell.setPadding(8f);
        cell.setBorder(Rectangle.BOX);
        return cell;
    }

    public static PdfPCell addressCell(String title, String[] lines) {
        com.lowagie.text.Paragraph paragraph = new com.lowagie.text.Paragraph();
        paragraph.add(new Phrase(title + "\n", sectionFont()));

        for (String line : lines) {
            if (line != null && !line.isBlank()) {
                paragraph.add(new Phrase(line + "\n", normalFont()));
            }
        }

        PdfPCell cell = new PdfPCell(paragraph);
        cell.setPadding(8f);
        cell.setBorder(Rectangle.BOX);
        cell.setMinimumHeight(110f);
        return cell;
    }

    public static void addHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, boldFont()));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6f);
        table.addCell(cell);
    }

    public static PdfPCell bodyCell(String text, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, normalFont()));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6f);
        return cell;
    }

    public static PdfPCell totalLabelCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, boldFont()));
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setPadding(6f);
        return cell;
    }

    public static PdfPCell totalValueCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, normalFont()));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setPadding(6f);
        return cell;
    }

    public static PdfPCell totalValueCellBold(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, boldFont()));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setPadding(6f);
        return cell;
    }

    public static PdfPCell bodyBlockCell(String text) {
        PdfPCell body = new PdfPCell(new Phrase(text, normalFont()));
        body.setPadding(8f);
        body.setBorder(Rectangle.LEFT | Rectangle.RIGHT | Rectangle.BOTTOM);
        return body;
    }

    public static BigDecimal safe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    public static String formatDate(LocalDate value) {
        return value != null ? value.format(DATE_FORMAT) : "—";
    }

    public static String formatAmount(BigDecimal value) {
        return AMOUNT_FORMAT.format(safe(value));
    }

    public static String valueOrDash(String value) {
        return value == null || value.isBlank() ? "—" : value;
    }

    public static String joinAddress(String line1, String line2, String city, String state, String pincode, String country) {
        StringBuilder sb = new StringBuilder();

        appendPart(sb, line1);
        appendPart(sb, line2);
        appendPart(sb, city);
        appendPart(sb, state);
        appendPart(sb, pincode);
        appendPart(sb, country);

        return sb.length() == 0 ? "—" : sb.toString();
    }

    private static void appendPart(StringBuilder sb, String value) {
        if (value == null || value.isBlank()) {
            return;
        }

        if (sb.length() > 0) {
            sb.append(", ");
        }
        sb.append(value);
    }

    public static String sanitizeFileName(String value) {
        return value.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    public static String amountInWords(BigDecimal amount) {
        BigDecimal normalized = safe(amount).setScale(2, BigDecimal.ROUND_HALF_UP);
        long rupees = normalized.longValue();
        int paise = normalized
                .subtract(BigDecimal.valueOf(rupees))
                .movePointRight(2)
                .intValue();

        StringBuilder result = new StringBuilder("INR ");
        result.append(numberToWords(rupees)).append(" Rupees");

        if (paise > 0) {
            result.append(" and ").append(numberToWords(paise)).append(" Paise");
        }

        result.append(" Only");
        return result.toString();
    }

    private static String numberToWords(long number) {
        if (number == 0) {
            return "Zero";
        }

        String[] ones = {
                "", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
                "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen",
                "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
        };

        String[] tens = {
                "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
        };

        StringBuilder words = new StringBuilder();

        if (number / 10000000 > 0) {
            words.append(numberToWords(number / 10000000)).append(" Crore ");
            number %= 10000000;
        }

        if (number / 100000 > 0) {
            words.append(numberToWords(number / 100000)).append(" Lakh ");
            number %= 100000;
        }

        if (number / 1000 > 0) {
            words.append(numberToWords(number / 1000)).append(" Thousand ");
            number %= 1000;
        }

        if (number / 100 > 0) {
            words.append(numberToWords(number / 100)).append(" Hundred ");
            number %= 100;
        }

        if (number > 0) {
            if (number < 20) {
                words.append(ones[(int) number]);
            } else {
                words.append(tens[(int) (number / 10)]);
                if (number % 10 > 0) {
                    words.append(" ").append(ones[(int) (number % 10)]);
                }
            }
        }

        return words.toString().trim();
    }
}