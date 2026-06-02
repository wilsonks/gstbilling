package com.wilsonks.gstbilling.invoice.export;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.pdf.PdfPTable;
import com.wilsonks.gstbilling.invoice.Invoice;
import com.wilsonks.gstbilling.invoice.InvoiceLine;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class InvoicePdfLineItemsSection {

    private InvoicePdfLineItemsSection() {
    }

    public static void render(Document document, Invoice invoice) {
        List<InvoiceLine> lines = sortedLines(invoice);
        addLineItemsTable(document, lines);
        addGstSummaryByRate(document, lines);
    }

    private static List<InvoiceLine> sortedLines(Invoice invoice) {
        if (invoice.getLines() == null) {
            return List.of();
        }

        return invoice.getLines().stream()
                .sorted(Comparator.comparing(
                        InvoiceLine::getLineNo,
                        Comparator.nullsLast(Integer::compareTo)
                ))
                .toList();
    }

    private static void addLineItemsTable(Document document, List<InvoiceLine> lines) {
        PdfPTable linesTable = new PdfPTable(11);
        linesTable.setWidthPercentage(100);
        linesTable.setSpacingAfter(12f);
        linesTable.setWidths(new float[]{0.6f, 1.7f, 2.4f, 1.0f, 0.9f, 0.8f, 1.0f, 1.0f, 0.9f, 1.0f, 1.1f});

        InvoicePdfStyles.addHeader(linesTable, "#");
        InvoicePdfStyles.addHeader(linesTable, "Item");
        InvoicePdfStyles.addHeader(linesTable, "Description");
        InvoicePdfStyles.addHeader(linesTable, "HSN/SAC");
        InvoicePdfStyles.addHeader(linesTable, "Unit");
        InvoicePdfStyles.addHeader(linesTable, "Qty");
        InvoicePdfStyles.addHeader(linesTable, "Unit Price");
        InvoicePdfStyles.addHeader(linesTable, "Taxable");
        InvoicePdfStyles.addHeader(linesTable, "GST %");
        InvoicePdfStyles.addHeader(linesTable, "Tax");
        InvoicePdfStyles.addHeader(linesTable, "Total");
        linesTable.setHeaderRows(1);

        for (InvoiceLine line : lines) {
            linesTable.addCell(InvoicePdfStyles.bodyCell(
                    InvoicePdfStyles.valueOrDash(line.getLineNo() != null ? String.valueOf(line.getLineNo()) : null),
                    Element.ALIGN_CENTER
            ));
            linesTable.addCell(InvoicePdfStyles.bodyCell(
                    InvoicePdfStyles.valueOrDash(line.getProductName()),
                    Element.ALIGN_LEFT
            ));
            linesTable.addCell(InvoicePdfStyles.bodyCell(
                    InvoicePdfStyles.valueOrDash(line.getDescription()),
                    Element.ALIGN_LEFT
            ));
            linesTable.addCell(InvoicePdfStyles.bodyCell(
                    InvoicePdfStyles.valueOrDash(line.getHsnSacCode()),
                    Element.ALIGN_CENTER
            ));
            linesTable.addCell(InvoicePdfStyles.bodyCell(
                    InvoicePdfStyles.valueOrDash(line.getUnitCode()),
                    Element.ALIGN_CENTER
            ));
            linesTable.addCell(InvoicePdfStyles.bodyCell(
                    InvoicePdfStyles.formatAmount(line.getQuantity()),
                    Element.ALIGN_RIGHT
            ));
            linesTable.addCell(InvoicePdfStyles.bodyCell(
                    InvoicePdfStyles.formatAmount(line.getUnitPrice()),
                    Element.ALIGN_RIGHT
            ));
            linesTable.addCell(InvoicePdfStyles.bodyCell(
                    InvoicePdfStyles.formatAmount(line.getTaxableAmount()),
                    Element.ALIGN_RIGHT
            ));
            linesTable.addCell(InvoicePdfStyles.bodyCell(
                    InvoicePdfStyles.formatAmount(line.getGstRate()),
                    Element.ALIGN_RIGHT
            ));
            linesTable.addCell(InvoicePdfStyles.bodyCell(
                    InvoicePdfStyles.formatAmount(totalLineTax(line)),
                    Element.ALIGN_RIGHT
            ));
            linesTable.addCell(InvoicePdfStyles.bodyCell(
                    InvoicePdfStyles.formatAmount(line.getLineTotalAmount()),
                    Element.ALIGN_RIGHT
            ));
        }

        document.add(linesTable);
    }

    private static void addGstSummaryByRate(Document document, List<InvoiceLine> lines) {
        if (lines.isEmpty()) {
            return;
        }

        Map<String, GstRateSummary> summaryByRate = new LinkedHashMap<>();

        for (InvoiceLine line : lines) {
            String key = InvoicePdfStyles.formatAmount(line.getGstRate());
            GstRateSummary summary = summaryByRate.computeIfAbsent(key, ignored -> new GstRateSummary());

            summary.addTaxableAmount(line.getTaxableAmount());
            summary.addCgstAmount(line.getCgstAmount());
            summary.addSgstAmount(line.getSgstAmount());
            summary.addIgstAmount(line.getIgstAmount());
        }

        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.setSpacingAfter(12f);
        table.setWidths(new float[]{1.0f, 1.2f, 1.0f, 1.0f, 1.0f, 1.0f});

        table.addCell(InvoicePdfStyles.sectionTitleCell("GST Summary By Rate", 6));

        InvoicePdfStyles.addHeader(table, "GST %");
        InvoicePdfStyles.addHeader(table, "Taxable");
        InvoicePdfStyles.addHeader(table, "CGST");
        InvoicePdfStyles.addHeader(table, "SGST");
        InvoicePdfStyles.addHeader(table, "IGST");
        InvoicePdfStyles.addHeader(table, "Total Tax");
        table.setHeaderRows(2);

        for (Map.Entry<String, GstRateSummary> entry : summaryByRate.entrySet()) {
            GstRateSummary value = entry.getValue();
            table.addCell(InvoicePdfStyles.bodyCell(entry.getKey(), Element.ALIGN_RIGHT));
            table.addCell(InvoicePdfStyles.bodyCell(InvoicePdfStyles.formatAmount(value.getTaxableAmount()), Element.ALIGN_RIGHT));
            table.addCell(InvoicePdfStyles.bodyCell(InvoicePdfStyles.formatAmount(value.getCgstAmount()), Element.ALIGN_RIGHT));
            table.addCell(InvoicePdfStyles.bodyCell(InvoicePdfStyles.formatAmount(value.getSgstAmount()), Element.ALIGN_RIGHT));
            table.addCell(InvoicePdfStyles.bodyCell(InvoicePdfStyles.formatAmount(value.getIgstAmount()), Element.ALIGN_RIGHT));
            table.addCell(InvoicePdfStyles.bodyCell(InvoicePdfStyles.formatAmount(value.getTotalTax()), Element.ALIGN_RIGHT));
        }

        document.add(table);
    }

    private static java.math.BigDecimal totalLineTax(InvoiceLine line) {
        return InvoicePdfStyles.safe(line.getCgstAmount())
                .add(InvoicePdfStyles.safe(line.getSgstAmount()))
                .add(InvoicePdfStyles.safe(line.getIgstAmount()));
    }
}