package com.wilsonks.gstbilling.invoice.export;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.wilsonks.gstbilling.context.TenantContext;
import com.wilsonks.gstbilling.invoice.Invoice;
import com.wilsonks.gstbilling.invoice.InvoiceLine;
import com.wilsonks.gstbilling.invoice.InvoiceRepository;
import com.wilsonks.gstbilling.invoice.sequence.DocumentType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class InvoicePdfExportService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DecimalFormat AMOUNT_FORMAT = new DecimalFormat("#,##0.00");

    private final InvoiceRepository invoiceRepository;

    public InvoicePdfFile export(Long invoiceId) {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant in request context");
        }

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));

        if (!tenantId.equals(invoice.getTenantId())) {
            throw new IllegalArgumentException("You cannot access an invoice from another tenant");
        }

        byte[] pdfBytes = buildPdf(invoice);
        String safeInvoiceNo = sanitizeFileName(invoice.getInvoiceNo() != null ? invoice.getInvoiceNo() : "invoice");

        return new InvoicePdfFile(safeInvoiceNo + ".pdf", pdfBytes);
    }

    private byte[] buildPdf(Invoice invoice) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document document = new Document(PageSize.A4, 24, 24, 24, 24);
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

        Paragraph title = new Paragraph(resolveDocumentTitle(invoice.getDocumentType()), titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(12f);
        document.add(title);

        PdfPTable summary = new PdfPTable(2);
        summary.setWidthPercentage(100);
        summary.setSpacingAfter(10f);
        summary.setWidths(new float[]{1f, 1f});

        summary.addCell(infoCell("Document No", valueOrDash(invoice.getInvoiceNo()), boldFont, normalFont));
        summary.addCell(infoCell("Document Date", formatDate(invoice.getInvoiceDate()), boldFont, normalFont));
        summary.addCell(infoCell("Due Date", formatDate(invoice.getDueDate()), boldFont, normalFont));
        summary.addCell(infoCell("Status", valueOrDash(invoice.getStatus() != null ? invoice.getStatus().name() : null), boldFont, normalFont));
        summary.addCell(infoCell("Tax Type", valueOrDash(invoice.getTaxType() != null ? invoice.getTaxType().name() : null), boldFont, normalFont));
        summary.addCell(infoCell("Place of Supply", valueOrDash(invoice.getPlaceOfSupplyStateCode()), boldFont, normalFont));
        document.add(summary);

        PdfPTable parties = new PdfPTable(2);
        parties.setWidthPercentage(100);
        parties.setSpacingAfter(12f);
        parties.setWidths(new float[]{1f, 1f});

        parties.addCell(addressCell("Seller", new String[]{
                valueOrDash(invoice.getSellerLegalName()),
                "GSTIN: " + valueOrDash(invoice.getSellerGstin()),
                joinAddress(
                        invoice.getSellerAddressLine1(),
                        invoice.getSellerAddressLine2(),
                        invoice.getSellerCity(),
                        invoice.getSellerState(),
                        invoice.getSellerPincode(),
                        invoice.getSellerCountry()
                ),
                "State Code: " + valueOrDash(invoice.getSellerStateCode())
        }, sectionFont, normalFont));

        parties.addCell(addressCell("Customer", new String[]{
                valueOrDash(invoice.getCustomerLegalName()),
                invoice.getCustomerTradeName() != null && !invoice.getCustomerTradeName().isBlank()
                        ? "Trade Name: " + invoice.getCustomerTradeName()
                        : null,
                "GSTIN: " + valueOrDash(invoice.getCustomerGstin()),
                joinAddress(
                        invoice.getCustomerBillingAddressLine1(),
                        invoice.getCustomerBillingAddressLine2(),
                        invoice.getCustomerBillingCity(),
                        invoice.getCustomerBillingState(),
                        invoice.getCustomerBillingPincode(),
                        invoice.getCustomerBillingCountry()
                ),
                "State Code: " + valueOrDash(invoice.getCustomerBillingStateCode())
        }, sectionFont, normalFont));

        document.add(parties);

        PdfPTable linesTable = new PdfPTable(10);
        linesTable.setWidthPercentage(100);
        linesTable.setSpacingAfter(12f);
        linesTable.setWidths(new float[]{0.7f, 2.0f, 1.1f, 0.9f, 0.9f, 1.1f, 1.0f, 1.0f, 1.0f, 1.2f});

        addHeader(linesTable, "#", boldFont);
        addHeader(linesTable, "Item", boldFont);
        addHeader(linesTable, "HSN/SAC", boldFont);
        addHeader(linesTable, "Unit", boldFont);
        addHeader(linesTable, "Qty", boldFont);
        addHeader(linesTable, "Unit Price", boldFont);
        addHeader(linesTable, "Taxable", boldFont);
        addHeader(linesTable, "GST %", boldFont);
        addHeader(linesTable, "Tax", boldFont);
        addHeader(linesTable, "Total", boldFont);

        for (InvoiceLine line : invoice.getLines()) {
            linesTable.addCell(bodyCell(String.valueOf(line.getLineNo()), normalFont, Element.ALIGN_CENTER));
            linesTable.addCell(bodyCell(buildLineLabel(line), normalFont, Element.ALIGN_LEFT));
            linesTable.addCell(bodyCell(valueOrDash(line.getHsnSacCode()), normalFont, Element.ALIGN_CENTER));
            linesTable.addCell(bodyCell(valueOrDash(line.getUnitCode()), normalFont, Element.ALIGN_CENTER));
            linesTable.addCell(bodyCell(formatAmount(line.getQuantity()), normalFont, Element.ALIGN_RIGHT));
            linesTable.addCell(bodyCell(formatAmount(line.getUnitPrice()), normalFont, Element.ALIGN_RIGHT));
            linesTable.addCell(bodyCell(formatAmount(line.getTaxableAmount()), normalFont, Element.ALIGN_RIGHT));
            linesTable.addCell(bodyCell(formatAmount(line.getGstRate()), normalFont, Element.ALIGN_RIGHT));
            linesTable.addCell(bodyCell(formatAmount(totalLineTax(line)), normalFont, Element.ALIGN_RIGHT));
            linesTable.addCell(bodyCell(formatAmount(line.getLineTotalAmount()), normalFont, Element.ALIGN_RIGHT));
        }

        document.add(linesTable);

        PdfPTable totals = new PdfPTable(2);
        totals.setWidthPercentage(40);
        totals.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totals.setSpacingAfter(12f);
        totals.setWidths(new float[]{1.4f, 1f});

        totals.addCell(totalLabelCell("Taxable Amount", boldFont));
        totals.addCell(totalValueCell(formatAmount(invoice.getTotalTaxableAmount()), normalFont));

        totals.addCell(totalLabelCell("CGST", boldFont));
        totals.addCell(totalValueCell(formatAmount(invoice.getTotalCgstAmount()), normalFont));

        totals.addCell(totalLabelCell("SGST", boldFont));
        totals.addCell(totalValueCell(formatAmount(invoice.getTotalSgstAmount()), normalFont));

        totals.addCell(totalLabelCell("IGST", boldFont));
        totals.addCell(totalValueCell(formatAmount(invoice.getTotalIgstAmount()), normalFont));

        totals.addCell(totalLabelCell("Total Tax", boldFont));
        totals.addCell(totalValueCell(formatAmount(invoice.getTotalTaxAmount()), normalFont));

        totals.addCell(totalLabelCell("Document Total", boldFont));
        totals.addCell(totalValueCell(formatAmount(invoice.getTotalInvoiceAmount()), boldFont));

        document.add(totals);

        if (invoice.getNotes() != null && !invoice.getNotes().isBlank()) {
            Paragraph notesHeader = new Paragraph("Notes", sectionFont);
            notesHeader.setSpacingBefore(8f);
            notesHeader.setSpacingAfter(4f);
            document.add(notesHeader);

            Paragraph notes = new Paragraph(invoice.getNotes(), normalFont);
            notes.setSpacingAfter(8f);
            document.add(notes);
        }

        if (invoice.getTermsAndConditions() != null && !invoice.getTermsAndConditions().isBlank()) {
            Paragraph termsHeader = new Paragraph("Terms and Conditions", sectionFont);
            termsHeader.setSpacingBefore(4f);
            termsHeader.setSpacingAfter(4f);
            document.add(termsHeader);

            Paragraph terms = new Paragraph(invoice.getTermsAndConditions(), normalFont);
            document.add(terms);
        }

        document.close();
        return out.toByteArray();
    }

    private String resolveDocumentTitle(DocumentType documentType) {
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

    private PdfPCell infoCell(String label, String value, Font labelFont, Font valueFont) {
        Phrase phrase = new Phrase();
        phrase.add(new Phrase(label + ": ", labelFont));
        phrase.add(new Phrase(value, valueFont));

        PdfPCell cell = new PdfPCell(phrase);
        cell.setPadding(8f);
        cell.setBorder(Rectangle.BOX);
        return cell;
    }

    private PdfPCell addressCell(String title, String[] lines, Font titleFont, Font bodyFont) {
        Paragraph paragraph = new Paragraph();
        paragraph.add(new Phrase(title + "\n", titleFont));

        for (String line : lines) {
            if (line != null && !line.isBlank()) {
                paragraph.add(new Phrase(line + "\n", bodyFont));
            }
        }

        PdfPCell cell = new PdfPCell(paragraph);
        cell.setPadding(8f);
        cell.setBorder(Rectangle.BOX);
        cell.setMinimumHeight(110f);
        return cell;
    }

    private void addHeader(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6f);
        table.addCell(cell);
    }

    private PdfPCell bodyCell(String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6f);
        return cell;
    }

    private PdfPCell totalLabelCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setPadding(6f);
        return cell;
    }

    private PdfPCell totalValueCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setPadding(6f);
        return cell;
    }

    private String buildLineLabel(InvoiceLine line) {
        String name = valueOrDash(line.getProductName());
        if (line.getDescription() != null && !line.getDescription().isBlank()) {
            return name + " - " + line.getDescription();
        }
        return name;
    }

    private BigDecimal totalLineTax(InvoiceLine line) {
        return safe(line.getCgstAmount())
                .add(safe(line.getSgstAmount()))
                .add(safe(line.getIgstAmount()));
    }

    private BigDecimal safe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private String formatDate(LocalDate value) {
        return value != null ? value.format(DATE_FORMAT) : "—";
    }

    private String formatAmount(BigDecimal value) {
        return AMOUNT_FORMAT.format(safe(value));
    }

    private String valueOrDash(String value) {
        return value == null || value.isBlank() ? "—" : value;
    }

    private String joinAddress(String line1, String line2, String city, String state, String pincode, String country) {
        StringBuilder sb = new StringBuilder();

        appendPart(sb, line1);
        appendPart(sb, line2);
        appendPart(sb, city);
        appendPart(sb, state);
        appendPart(sb, pincode);
        appendPart(sb, country);

        return sb.length() == 0 ? "—" : sb.toString();
    }

    private void appendPart(StringBuilder sb, String value) {
        if (value == null || value.isBlank()) {
            return;
        }

        if (sb.length() > 0) {
            sb.append(", ");
        }
        sb.append(value);
    }

    private String sanitizeFileName(String value) {
        return value.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}