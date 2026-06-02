package com.wilsonks.gstbilling.invoice.export;

import com.lowagie.text.Document;
import com.lowagie.text.pdf.PdfPTable;
import com.wilsonks.gstbilling.invoice.Invoice;

public final class InvoicePdfPartySection {

    private InvoicePdfPartySection() {
    }

    public static void render(Document document, Invoice invoice) {
        addPartySections(document, invoice);
        addShippingSection(document, invoice);
    }

    private static void addPartySections(Document document, Invoice invoice) {
        PdfPTable parties = new PdfPTable(2);
        parties.setWidthPercentage(100);
        parties.setSpacingAfter(12f);
        parties.setWidths(new float[]{1f, 1f});

        parties.addCell(InvoicePdfStyles.addressCell("Seller", new String[]{
                InvoicePdfStyles.valueOrDash(invoice.getSellerLegalName()),
                "GSTIN: " + InvoicePdfStyles.valueOrDash(invoice.getSellerGstin()),
                InvoicePdfStyles.joinAddress(
                        invoice.getSellerAddressLine1(),
                        invoice.getSellerAddressLine2(),
                        invoice.getSellerCity(),
                        invoice.getSellerState(),
                        invoice.getSellerPincode(),
                        invoice.getSellerCountry()
                ),
                "State Code: " + InvoicePdfStyles.valueOrDash(invoice.getSellerStateCode())
        }));

        parties.addCell(InvoicePdfStyles.addressCell("Bill To", new String[]{
                InvoicePdfStyles.valueOrDash(invoice.getCustomerLegalName()),
                invoice.getCustomerTradeName() != null && !invoice.getCustomerTradeName().isBlank()
                        ? "Trade Name: " + invoice.getCustomerTradeName()
                        : null,
                "GSTIN: " + InvoicePdfStyles.valueOrDash(invoice.getCustomerGstin()),
                InvoicePdfStyles.joinAddress(
                        invoice.getCustomerBillingAddressLine1(),
                        invoice.getCustomerBillingAddressLine2(),
                        invoice.getCustomerBillingCity(),
                        invoice.getCustomerBillingState(),
                        invoice.getCustomerBillingPincode(),
                        invoice.getCustomerBillingCountry()
                ),
                "State Code: " + InvoicePdfStyles.valueOrDash(invoice.getCustomerBillingStateCode())
        }));

        document.add(parties);
    }

    private static void addShippingSection(Document document, Invoice invoice) {
        String billingAddress = InvoicePdfStyles.joinAddress(
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

        shipping.addCell(InvoicePdfStyles.addressCell("Ship To", new String[]{
                InvoicePdfStyles.valueOrDash(invoice.getCustomerLegalName()),
                billingAddress,
                "State Code: " + InvoicePdfStyles.valueOrDash(invoice.getCustomerBillingStateCode())
        }));

        document.add(shipping);
    }
}