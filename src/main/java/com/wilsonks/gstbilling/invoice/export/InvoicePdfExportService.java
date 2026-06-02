package com.wilsonks.gstbilling.invoice.export;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.GrayColor;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
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
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InvoicePdfExportService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DateTimeFormatter TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
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

        Invoice referenceInvoice = resolveReferenceInvoice(invoice, tenantId);
        OffsetDateTime generatedAt = OffsetDateTime.now();
        byte[] pdfBytes = buildPdf(invoice, referenceInvoice, generatedAt);

        String fileName = buildFileName(invoice);
        return new InvoicePdfFile(fileName, pdfBytes);
    }

    private Invoice resolveReferenceInvoice(Invoice invoice, Long tenantId) {
        if (invoice.getReferenceInvoiceId() == null) {
            return null;
        }

        return invoiceRepository.findById(invoice.getReferenceInvoiceId())
                .filter(ref -> tenantId.equals(ref.getTenantId()))
                .orElse(null);
    }

    private byte[] buildPdf(Invoice invoice, Invoice referenceInvoice, OffsetDateTime generatedAt) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document document = new Document(PageSize.A4, 24, 24, 32, 42);
        PdfWriter writer = PdfWriter.getInstance(document, out);
        writer.setPageEvent(new InvoicePdfPageEvent(invoice, generatedAt));

        document.open();

        Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9);
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
        Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

        addHeaderBanner(document, invoice, brandFont, titleFont, subtitleFont, normalFont);
        addDocumentMetadata(document, invoice, boldFont, normalFont);
        addReferenceInvoiceSection(document, invoice, referenceInvoice, sectionFont, boldFont, normalFont);
        addPartySections(document, invoice, sectionFont, normalFont);
        addShippingSection(document, invoice, sectionFont, normalFont);
        addLineItemsTable(document, invoice, boldFont, normalFont);
        addGstSummaryByRate(document, invoice.getLines(), sectionFont, boldFont, normalFont);
        addTotalsSection(document, invoice, boldFont, normalFont);
        addAmountInWords(document, invoice, boldFont);
        addBoxedSection(document, "Notes", invoice.getNotes(), sectionFont, normalFont);
        addBoxedSection(document, "Terms and Conditions", invoice.getTermsAndConditions(), sectionFont, normalFont);
        addAuthorizedSignatorySection(document, invoice, sectionFont, smallFont, normalFont);

        document.close();
        return out.toByteArray();
    }

    private void addHeaderBanner(
            Document document,
            Invoice invoice,
            Font brandFont,
            Font titleFont,
            Font subtitleFont,
            Font normalFont
    ) {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingAfter(12f);

        PdfPCell cell = new PdfPCell();
        cell.setPadding(10f);
        cell.setBorder(Rectangle.BOX);

        Paragraph seller = new Paragraph(valueOrDash(invoice.getSellerLegalName()), brandFont);
        seller.setAlignment(Element.ALIGN_CENTER);
        seller.setSpacingAfter(4f);
        cell.addElement(seller);

        Paragraph address = new Paragraph(
                joinAddress(
                        invoice.getSellerAddressLine1(),
                        invoice.getSellerAddressLine2(),
                        invoice.getSellerCity(),
                        invoice.getSellerState(),
                        invoice.getSellerPincode(),
                        invoice.getSellerCountry()
                ),
                normalFont
        );
        address.setAlignment(Element.ALIGN_CENTER);
        address.setSpacingAfter(3f);
        cell.addElement(address);

        Paragraph gst = new Paragraph("GSTIN: " + valueOrDash(invoice.getSellerGstin()), normalFont);
        gst.setAlignment(Element.ALIGN_CENTER);
        gst.setSpacingAfter(8f);
        cell.addElement(gst);

        Paragraph title = new Paragraph(resolveDocumentTitle(invoice.getDocumentType()), titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(2f);
        cell.addElement(title);

        String subtitleText = resolveDocumentSubtitle(invoice.getDocumentType());
        if (subtitleText != null) {
            Paragraph subtitle = new Paragraph(subtitleText, subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            cell.addElement(subtitle);
        }

        table.addCell(cell);
        document.add(table);
    }

    private void addDocumentMetadata(Document document, Invoice invoice, Font boldFont, Font normalFont) throws com.lowagie.text.DocumentException {
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
    }

    private void addReferenceInvoiceSection(
            Document document,
            Invoice invoice,
            Invoice referenceInvoice,
            Font sectionFont,
            Font labelFont,
            Font valueFont
    ) throws com.lowagie.text.DocumentException {
        if (invoice.getDocumentType() != DocumentType.CREDIT_NOTE
                && invoice.getDocumentType() != DocumentType.DEBIT_NOTE) {
            return;
        }

        PdfPTable referenceTable = new PdfPTable(2);
        referenceTable.setWidthPercentage(100);
        referenceTable.setSpacingAfter(12f);
        referenceTable.setWidths(new float[]{1f, 1f});

        PdfPCell titleCell = new PdfPCell(new Phrase("Reference Invoice", sectionFont));
        titleCell.setColspan(2);
        titleCell.setPadding(8f);
        titleCell.setBorder(Rectangle.BOX);
        referenceTable.addCell(titleCell);

        referenceTable.addCell(infoCell(
                "Reference Invoice No",
                valueOrDash(invoice.getReferenceInvoiceNo()),
                labelFont,
                valueFont
        ));

        referenceTable.addCell(infoCell(
                "Reference Invoice Date",
                formatDate(referenceInvoice != null ? referenceInvoice.getInvoiceDate() : null),
                labelFont,
                valueFont
        ));

        document.add(referenceTable);
    }

    private void addPartySections(Document document, Invoice invoice, Font sectionFont, Font normalFont) throws com.lowagie.text.DocumentException {
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

        parties.addCell(addressCell("Bill To", new String[]{
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
    }

    private void addShippingSection(Document document, Invoice invoice, Font sectionFont, Font normalFont) throws com.lowagie.text.DocumentException {
        String billingAddress = joinAddress(
                invoice.getCustomerBillingAddressLine1(),
                invoice.getCustomerBillingAddressLine2(),
                invoice.getCustomerBillingCity(),
                invoice.getCustomerBillingState(),
                invoice.getCustomerBillingPincode(),
                invoice.getCustomerBillingCountry()
        );

        if ("—".equals(billingAddress)) {
            return;
        }

        PdfPTable shipping = new PdfPTable(1);
        shipping.setWidthPercentage(100);
        shipping.setSpacingAfter(12f);

        shipping.addCell(addressCell("Ship To", new String[]{
                valueOrDash(invoice.getCustomerLegalName()),
                billingAddress,
                "State Code: " + valueOrDash(invoice.getCustomerBillingStateCode())
        }, sectionFont, normalFont));

        document.add(shipping);
    }

    private void addLineItemsTable(Document document, Invoice invoice, Font boldFont, Font normalFont) throws com.lowagie.text.DocumentException {
        PdfPTable linesTable = new PdfPTable(11);
        linesTable.setWidthPercentage(100);
        linesTable.setSpacingAfter(12f);
        linesTable.setWidths(new float[]{0.6f, 1.7f, 2.4f, 1.0f, 0.9f, 0.8f, 1.0f, 1.0f, 0.9f, 1.0f, 1.1f});

        addHeader(linesTable, "#", boldFont);
        addHeader(linesTable, "Item", boldFont);
        addHeader(linesTable, "Description", boldFont);
        addHeader(linesTable, "HSN/SAC", boldFont);
        addHeader(linesTable, "Unit", boldFont);
        addHeader(linesTable, "Qty", boldFont);
        addHeader(linesTable, "Unit Price", boldFont);
        addHeader(linesTable, "Taxable", boldFont);
        addHeader(linesTable, "GST %", boldFont);
        addHeader(linesTable, "Tax", boldFont);
        addHeader(linesTable, "Total", boldFont);
        linesTable.setHeaderRows(1);

        List<InvoiceLine> lines = invoice.getLines() == null
                ? List.of()
                : invoice.getLines().stream()
                .sorted(Comparator.comparing(
                        InvoiceLine::getLineNo,
                        Comparator.nullsLast(Integer::compareTo)
                ))
                .toList();

        for (InvoiceLine line : lines) {
            linesTable.addCell(bodyCell(valueOrDash(line.getLineNo() != null ? String.valueOf(line.getLineNo()) : null), normalFont, Element.ALIGN_CENTER));
            linesTable.addCell(bodyCell(valueOrDash(line.getProductName()), normalFont, Element.ALIGN_LEFT));
            linesTable.addCell(bodyCell(valueOrDash(line.getDescription()), normalFont, Element.ALIGN_LEFT));
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
    }

    private void addGstSummaryByRate(
            Document document,
            List<InvoiceLine> rawLines,
            Font sectionFont,
            Font headerFont,
            Font bodyFont
    ) throws com.lowagie.text.DocumentException {
        List<InvoiceLine> lines = rawLines == null ? List.of() : rawLines;
        if (lines.isEmpty()) {
            return;
        }

        Map<String, GstRateSummary> summaryByRate = new LinkedHashMap<>();

        for (InvoiceLine line : lines) {
            String key = formatAmount(line.getGstRate());
            GstRateSummary summary = summaryByRate.computeIfAbsent(key, ignored -> new GstRateSummary());

            summary.taxableAmount = summary.taxableAmount.add(safe(line.getTaxableAmount()));
            summary.cgstAmount = summary.cgstAmount.add(safe(line.getCgstAmount()));
            summary.sgstAmount = summary.sgstAmount.add(safe(line.getSgstAmount()));
            summary.igstAmount = summary.igstAmount.add(safe(line.getIgstAmount()));
        }

        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.setSpacingAfter(12f);
        table.setWidths(new float[]{1.0f, 1.2f, 1.0f, 1.0f, 1.0f, 1.0f});

        PdfPCell sectionCell = new PdfPCell(new Phrase("GST Summary By Rate", sectionFont));
        sectionCell.setColspan(6);
        sectionCell.setPadding(8f);
        sectionCell.setBorder(Rectangle.BOX);
        table.addCell(sectionCell);

        addHeader(table, "GST %", headerFont);
        addHeader(table, "Taxable", headerFont);
        addHeader(table, "CGST", headerFont);
        addHeader(table, "SGST", headerFont);
        addHeader(table, "IGST", headerFont);
        addHeader(table, "Total Tax", headerFont);
        table.setHeaderRows(2);

        for (Map.Entry<String, GstRateSummary> entry : summaryByRate.entrySet()) {
            GstRateSummary value = entry.getValue();
            table.addCell(bodyCell(entry.getKey(), bodyFont, Element.ALIGN_RIGHT));
            table.addCell(bodyCell(formatAmount(value.taxableAmount), bodyFont, Element.ALIGN_RIGHT));
            table.addCell(bodyCell(formatAmount(value.cgstAmount), bodyFont, Element.ALIGN_RIGHT));
            table.addCell(bodyCell(formatAmount(value.sgstAmount), bodyFont, Element.ALIGN_RIGHT));
            table.addCell(bodyCell(formatAmount(value.igstAmount), bodyFont, Element.ALIGN_RIGHT));
            table.addCell(bodyCell(formatAmount(value.totalTax()), bodyFont, Element.ALIGN_RIGHT));
        }

        document.add(table);
    }

    private void addTotalsSection(Document document, Invoice invoice, Font boldFont, Font normalFont) throws com.lowagie.text.DocumentException {
        PdfPTable totals = new PdfPTable(2);
        totals.setWidthPercentage(40);
        totals.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totals.setSpacingAfter(8f);
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
    }

    private void addAmountInWords(Document document, Invoice invoice, Font boldFont) throws com.lowagie.text.DocumentException {
        Paragraph amountInWords = new Paragraph(
                "Amount in Words: " + amountInWords(invoice.getTotalInvoiceAmount()),
                boldFont
        );
        amountInWords.setSpacingAfter(12f);
        document.add(amountInWords);
    }

    private void addBoxedSection(
            Document document,
            String title,
            String content,
            Font titleFont,
            Font bodyFont
    ) throws com.lowagie.text.DocumentException {
        if (content == null || content.isBlank()) {
            return;
        }

        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingAfter(10f);

        PdfPCell header = new PdfPCell(new Phrase(title, titleFont));
        header.setPadding(8f);
        header.setBorder(Rectangle.BOX);
        table.addCell(header);

        PdfPCell body = new PdfPCell(new Phrase(content, bodyFont));
        body.setPadding(8f);
        body.setBorder(Rectangle.LEFT | Rectangle.RIGHT | Rectangle.BOTTOM);
        table.addCell(body);

        document.add(table);
    }

    private void addAuthorizedSignatorySection(
            Document document,
            Invoice invoice,
            Font sectionFont,
            Font helperFont,
            Font bodyFont
    ) throws com.lowagie.text.DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingBefore(8f);
        table.setSpacingAfter(4f);
        table.setWidths(new float[]{1.2f, 1f});

        PdfPCell left = new PdfPCell();
        left.setPadding(8f);
        left.setBorder(Rectangle.BOX);

        Paragraph generatedText = new Paragraph(
                "This is a system-generated document.",
                helperFont
        );
        generatedText.setSpacingAfter(6f);
        left.addElement(generatedText);

        String disclaimer = resolveDocumentFooterDisclaimer(invoice.getDocumentType());
        if (disclaimer != null) {
            left.addElement(new Paragraph(disclaimer, helperFont));
        }

        PdfPCell right = new PdfPCell();
        right.setPadding(8f);
        right.setBorder(Rectangle.BOX);

        Paragraph signatoryTitle = new Paragraph("Authorized Signatory", sectionFont);
        signatoryTitle.setAlignment(Element.ALIGN_CENTER);
        signatoryTitle.setSpacingAfter(28f);
        right.addElement(signatoryTitle);

        Paragraph sellerName = new Paragraph(valueOrDash(invoice.getSellerLegalName()), bodyFont);
        sellerName.setAlignment(Element.ALIGN_CENTER);
        right.addElement(sellerName);

        table.addCell(left);
        table.addCell(right);

        document.add(table);
    }

    private String buildFileName(Invoice invoice) {
        String prefix = switch (invoice.getDocumentType()) {
            case TAX_INVOICE -> "TAX_INVOICE";
            case PROFORMA_INVOICE -> "PROFORMA_INVOICE";
            case CREDIT_NOTE -> "CREDIT_NOTE";
            case DEBIT_NOTE -> "DEBIT_NOTE";
        };

        String number = sanitizeFileName(invoice.getInvoiceNo() != null ? invoice.getInvoiceNo() : "document");
        return prefix + "_" + number + ".pdf";
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

    private String resolveDocumentSubtitle(DocumentType documentType) {
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

    private String resolveDocumentFooterDisclaimer(DocumentType documentType) {
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

    private String amountInWords(BigDecimal amount) {
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

    private String numberToWords(long number) {
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

    private static final class GstRateSummary {
        private BigDecimal taxableAmount = BigDecimal.ZERO;
        private BigDecimal cgstAmount = BigDecimal.ZERO;
        private BigDecimal sgstAmount = BigDecimal.ZERO;
        private BigDecimal igstAmount = BigDecimal.ZERO;

        private BigDecimal totalTax() {
            return cgstAmount.add(sgstAmount).add(igstAmount);
        }
    }

    private static final class InvoicePdfPageEvent extends PdfPageEventHelper {

        private final Invoice invoice;
        private final OffsetDateTime generatedAt;
        private final Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 8);
        private final Font watermarkFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 52, new GrayColor(0.85f));

        private InvoicePdfPageEvent(Invoice invoice, OffsetDateTime generatedAt) {
            this.invoice = invoice;
            this.generatedAt = generatedAt;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            addWatermark(writer, document);
            addFooter(writer, document);
        }

        private void addWatermark(PdfWriter writer, Document document) {
            String watermark = resolveWatermark(invoice);
            if (watermark == null) {
                return;
            }

            PdfContentByte canvas = writer.getDirectContentUnder();
            Phrase phrase = new Phrase(watermark, watermarkFont);

            ColumnText.showTextAligned(
                    canvas,
                    Element.ALIGN_CENTER,
                    phrase,
                    (document.left() + document.right()) / 2,
                    (document.top() + document.bottom()) / 2,
                    45
            );
        }

        private void addFooter(PdfWriter writer, Document document) {
            PdfContentByte canvas = writer.getDirectContent();
            String generatedOn = "Generated on " + generatedAt.format(TIMESTAMP_FORMAT);
            String pageNumber = "Page " + writer.getPageNumber();

            ColumnText.showTextAligned(
                    canvas,
                    Element.ALIGN_LEFT,
                    new Phrase(generatedOn, footerFont),
                    document.left(),
                    document.bottom() - 18,
                    0
            );

            ColumnText.showTextAligned(
                    canvas,
                    Element.ALIGN_RIGHT,
                    new Phrase(pageNumber, footerFont),
                    document.right(),
                    document.bottom() - 18,
                    0
            );
        }

        private String resolveWatermark(Invoice invoice) {
            if (invoice == null) {
                return null;
            }

            if (invoice.getStatus() != null && "CANCELLED".equalsIgnoreCase(invoice.getStatus().name())) {
                return "CANCELLED";
            }

            if (invoice.getDocumentType() == DocumentType.PROFORMA_INVOICE) {
                return "PROFORMA";
            }

            return null;
        }
    }
}