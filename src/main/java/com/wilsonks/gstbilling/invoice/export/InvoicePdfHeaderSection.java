package com.wilsonks.gstbilling.invoice.export;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.wilsonks.gstbilling.invoice.Invoice;
import com.wilsonks.gstbilling.invoice.sequence.DocumentType;

public final class InvoicePdfHeaderSection {

    private InvoicePdfHeaderSection() {
    }

    public static void render(Document document, Invoice invoice, Invoice referenceInvoice) {
        addHeaderBanner(document, invoice);
        addDocumentMetadata(document, invoice);
        addReferenceInvoiceSection(document, invoice, referenceInvoice);
    }

    private static void addHeaderBanner(Document document, Invoice invoice) {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingAfter(12f);

        PdfPCell cell = new PdfPCell();
        cell.setPadding(10f);
        cell.setBorder(com.lowagie.text.Rectangle.BOX);

        Paragraph seller = new Paragraph(
                InvoicePdfStyles.valueOrDash(invoice.getSellerLegalName()),
                InvoicePdfStyles.brandFont()
        );
        seller.setAlignment(Element.ALIGN_CENTER);
        seller.setSpacingAfter(4f);
        cell.addElement(seller);

        Paragraph address = new Paragraph(
                InvoicePdfStyles.joinAddress(
                        invoice.getSellerAddressLine1(),
                        invoice.getSellerAddressLine2(),
                        invoice.getSellerCity(),
                        invoice.getSellerState(),
                        invoice.getSellerPincode(),
                        invoice.getSellerCountry()
                ),
                InvoicePdfStyles.normalFont()
        );
        address.setAlignment(Element.ALIGN_CENTER);
        address.setSpacingAfter(3f);
        cell.addElement(address);

        Paragraph gst = new Paragraph(
                "GSTIN: " + InvoicePdfStyles.valueOrDash(invoice.getSellerGstin()),
                InvoicePdfStyles.normalFont()
        );
        gst.setAlignment(Element.ALIGN_CENTER);
        gst.setSpacingAfter(8f);
        cell.addElement(gst);

        Paragraph title = new Paragraph(
                resolveDocumentTitle(invoice.getDocumentType()),
                InvoicePdfStyles.titleFont()
        );
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(2f);
        cell.addElement(title);

        String subtitleText = resolveDocumentSubtitle(invoice.getDocumentType());
        if (subtitleText != null) {
            Paragraph subtitle = new Paragraph(subtitleText, InvoicePdfStyles.subtitleFont());
            subtitle.setAlignment(Element.ALIGN_CENTER);
            cell.addElement(subtitle);
        }

        table.addCell(cell);
        document.add(table);
    }

    private static void addDocumentMetadata(Document document, Invoice invoice) {
        PdfPTable summary = new PdfPTable(2);
        summary.setWidthPercentage(100);
        summary.setSpacingAfter(10f);
        summary.setWidths(new float[]{1f, 1f});

        summary.addCell(InvoicePdfStyles.infoCell("Document No", InvoicePdfStyles.valueOrDash(invoice.getInvoiceNo())));
        summary.addCell(InvoicePdfStyles.infoCell("Document Date", InvoicePdfStyles.formatDate(invoice.getInvoiceDate())));
        summary.addCell(InvoicePdfStyles.infoCell("Due Date", InvoicePdfStyles.formatDate(invoice.getDueDate())));
        summary.addCell(InvoicePdfStyles.infoCell("Status", InvoicePdfStyles.valueOrDash(invoice.getStatus() != null ? invoice.getStatus().name() : null)));
        summary.addCell(InvoicePdfStyles.infoCell("Tax Type", InvoicePdfStyles.valueOrDash(invoice.getTaxType() != null ? invoice.getTaxType().name() : null)));
        summary.addCell(InvoicePdfStyles.infoCell("Place of Supply", InvoicePdfStyles.valueOrDash(invoice.getPlaceOfSupplyStateCode())));

        document.add(summary);
    }

    private static void addReferenceInvoiceSection(Document document, Invoice invoice, Invoice referenceInvoice) {
        if (invoice.getDocumentType() != DocumentType.CREDIT_NOTE
                && invoice.getDocumentType() != DocumentType.DEBIT_NOTE) {
            return;
        }

        PdfPTable referenceTable = new PdfPTable(2);
        referenceTable.setWidthPercentage(100);
        referenceTable.setSpacingAfter(12f);
        referenceTable.setWidths(new float[]{1f, 1f});

        referenceTable.addCell(InvoicePdfStyles.sectionTitleCell("Reference Invoice", 2));
        referenceTable.addCell(InvoicePdfStyles.infoCell(
                "Reference Invoice No",
                InvoicePdfStyles.valueOrDash(invoice.getReferenceInvoiceNo())
        ));
        referenceTable.addCell(InvoicePdfStyles.infoCell(
                "Reference Invoice Date",
                InvoicePdfStyles.formatDate(referenceInvoice != null ? referenceInvoice.getInvoiceDate() : null)
        ));

        document.add(referenceTable);
    }

    private static String resolveDocumentTitle(DocumentType documentType) {
        if (documentType == null) {
            return "TAX INVOICE";
        }

        return switch (documentType) {
            case TAX_INVOICE -> "TAX INVOICE";
            case PROFORMA_INVOICE -> "PROFORMA INVOICE";
            case CREDIT_NOTE -> "CREDIT NOTE";
            case DEBIT_NOTE -> "DEBIT NOTE";
        };
    }

    private static String resolveDocumentSubtitle(DocumentType documentType) {
        if (documentType == null) {
            return null;
        }

        return switch (documentType) {
            case TAX_INVOICE -> "Original tax document for recipient";
            case PROFORMA_INVOICE -> "This is not a tax invoice";
            case CREDIT_NOTE -> "Issued against a reference tax invoice";
            case DEBIT_NOTE -> "Additional amount raised against a reference tax invoice";
        };
    }
}