package com.wilsonks.gstbilling.invoice.export;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.wilsonks.gstbilling.invoice.Invoice;
import com.wilsonks.gstbilling.invoice.sequence.DocumentType;

public final class InvoicePdfTotalsSection {

    private InvoicePdfTotalsSection() {
    }

    public static void render(Document document, Invoice invoice) {
        addTotalsSection(document, invoice);
        addAmountInWords(document, invoice);
        addBoxedSection(document, "Notes", invoice.getNotes());
        addBoxedSection(document, "Terms and Conditions", invoice.getTermsAndConditions());
        addAuthorizedSignatorySection(document, invoice);
    }

    private static void addTotalsSection(Document document, Invoice invoice) {
        PdfPTable totals = new PdfPTable(2);
        totals.setWidthPercentage(40);
        totals.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totals.setSpacingAfter(8f);
        totals.setWidths(new float[]{1.4f, 1f});

        totals.addCell(InvoicePdfStyles.totalLabelCell("Taxable Amount"));
        totals.addCell(InvoicePdfStyles.totalValueCell(InvoicePdfStyles.formatAmount(invoice.getTotalTaxableAmount())));

        totals.addCell(InvoicePdfStyles.totalLabelCell("CGST"));
        totals.addCell(InvoicePdfStyles.totalValueCell(InvoicePdfStyles.formatAmount(invoice.getTotalCgstAmount())));

        totals.addCell(InvoicePdfStyles.totalLabelCell("SGST"));
        totals.addCell(InvoicePdfStyles.totalValueCell(InvoicePdfStyles.formatAmount(invoice.getTotalSgstAmount())));

        totals.addCell(InvoicePdfStyles.totalLabelCell("IGST"));
        totals.addCell(InvoicePdfStyles.totalValueCell(InvoicePdfStyles.formatAmount(invoice.getTotalIgstAmount())));

        totals.addCell(InvoicePdfStyles.totalLabelCell("Total Tax"));
        totals.addCell(InvoicePdfStyles.totalValueCell(InvoicePdfStyles.formatAmount(invoice.getTotalTaxAmount())));

        totals.addCell(InvoicePdfStyles.totalLabelCell("Document Total"));
        totals.addCell(InvoicePdfStyles.totalValueCellBold(InvoicePdfStyles.formatAmount(invoice.getTotalInvoiceAmount())));

        document.add(totals);
    }

    private static void addAmountInWords(Document document, Invoice invoice) {
        Paragraph amountInWords = new Paragraph(
                "Amount in Words: " + InvoicePdfStyles.amountInWords(invoice.getTotalInvoiceAmount()),
                InvoicePdfStyles.boldFont()
        );
        amountInWords.setSpacingAfter(12f);
        document.add(amountInWords);
    }

    private static void addBoxedSection(Document document, String title, String content) {
        if (content == null || content.isBlank()) {
            return;
        }

        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingAfter(10f);

        table.addCell(InvoicePdfStyles.sectionTitleCell(title, 1));

        PdfPCell body = InvoicePdfStyles.bodyBlockCell(content);
        table.addCell(body);

        document.add(table);
    }

    private static void addAuthorizedSignatorySection(Document document, Invoice invoice) {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingBefore(8f);
        table.setSpacingAfter(4f);
        table.setWidths(new float[]{1.2f, 1f});

        PdfPCell left = new PdfPCell();
        left.setPadding(8f);
        left.setBorder(com.lowagie.text.Rectangle.BOX);

        Paragraph generatedText = new Paragraph(
                "This is a system-generated document.",
                InvoicePdfStyles.smallFont()
        );
        generatedText.setSpacingAfter(6f);
        left.addElement(generatedText);

        String disclaimer = resolveDocumentFooterDisclaimer(invoice.getDocumentType());
        if (disclaimer != null) {
            left.addElement(new Paragraph(disclaimer, InvoicePdfStyles.smallFont()));
        }

        PdfPCell right = new PdfPCell();
        right.setPadding(8f);
        right.setBorder(com.lowagie.text.Rectangle.BOX);

        Paragraph signatoryTitle = new Paragraph("Authorized Signatory", InvoicePdfStyles.sectionFont());
        signatoryTitle.setAlignment(Element.ALIGN_CENTER);
        signatoryTitle.setSpacingAfter(28f);
        right.addElement(signatoryTitle);

        Paragraph sellerName = new Paragraph(
                InvoicePdfStyles.valueOrDash(invoice.getSellerLegalName()),
                InvoicePdfStyles.normalFont()
        );
        sellerName.setAlignment(Element.ALIGN_CENTER);
        right.addElement(sellerName);

        table.addCell(left);
        table.addCell(right);

        document.add(table);
    }

    private static String resolveDocumentFooterDisclaimer(DocumentType documentType) {
        if (documentType == null) {
            return null;
        }

        return switch (documentType) {
            case TAX_INVOICE -> null;
            case PROFORMA_INVOICE -> "Proforma invoice is for estimation or advance communication and may not be treated as a final tax invoice.";
            case CREDIT_NOTE -> "Credit note is issued as an adjustment against the referenced tax invoice.";
            case DEBIT_NOTE -> "Debit note is issued as an adjustment against the referenced tax invoice.";
        };
    }
}