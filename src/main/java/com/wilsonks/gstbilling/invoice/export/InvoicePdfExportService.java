package com.wilsonks.gstbilling.invoice.export;

import com.lowagie.text.Document;
import com.lowagie.text.PageSize;
import com.lowagie.text.pdf.PdfWriter;
import com.wilsonks.gstbilling.context.TenantContext;
import com.wilsonks.gstbilling.invoice.Invoice;
import com.wilsonks.gstbilling.invoice.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class InvoicePdfExportService {

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

        return new InvoicePdfFile(buildFileName(invoice), pdfBytes);
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

        InvoicePdfHeaderSection.render(document, invoice, referenceInvoice);
        InvoicePdfPartySection.render(document, invoice);
        InvoicePdfLineItemsSection.render(document, invoice);
        InvoicePdfTotalsSection.render(document, invoice);

        document.close();
        return out.toByteArray();
    }

    private String buildFileName(Invoice invoice) {
        String prefix = switch (invoice.getDocumentType()) {
            case TAX_INVOICE -> "TAX_INVOICE";
            case PROFORMA_INVOICE -> "PROFORMA_INVOICE";
            case CREDIT_NOTE -> "CREDIT_NOTE";
            case DEBIT_NOTE -> "DEBIT_NOTE";
        };

        String number = InvoicePdfStyles.sanitizeFileName(
                invoice.getInvoiceNo() != null ? invoice.getInvoiceNo() : "document"
        );
        return prefix + "_" + number + ".pdf";
    }
}