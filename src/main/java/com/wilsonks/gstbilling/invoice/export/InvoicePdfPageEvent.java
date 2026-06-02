package com.wilsonks.gstbilling.invoice.export;

import com.lowagie.text.Element;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.GrayColor;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.Document;
import com.wilsonks.gstbilling.invoice.Invoice;
import com.wilsonks.gstbilling.invoice.sequence.DocumentType;

import java.time.OffsetDateTime;

public class InvoicePdfPageEvent extends PdfPageEventHelper {

    private final Invoice invoice;
    private final OffsetDateTime generatedAt;

    public InvoicePdfPageEvent(Invoice invoice, OffsetDateTime generatedAt) {
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
        Phrase phrase = new Phrase(
                watermark,
                com.lowagie.text.FontFactory.getFont(
                        com.lowagie.text.FontFactory.HELVETICA_BOLD,
                        52,
                        new GrayColor(0.85f)
                )
        );

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
        String generatedOn = "Generated on " + generatedAt.format(InvoicePdfStyles.timestampFormat());
        String pageNumber = "Page " + writer.getPageNumber();

        ColumnText.showTextAligned(
                canvas,
                Element.ALIGN_LEFT,
                new Phrase(generatedOn, InvoicePdfStyles.footerFont()),
                document.left(),
                document.bottom() - 18,
                0
        );

        ColumnText.showTextAligned(
                canvas,
                Element.ALIGN_RIGHT,
                new Phrase(pageNumber, InvoicePdfStyles.footerFont()),
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