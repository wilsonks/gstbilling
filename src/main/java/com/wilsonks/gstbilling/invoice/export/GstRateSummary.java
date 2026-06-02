package com.wilsonks.gstbilling.invoice.export;

import java.math.BigDecimal;

public class GstRateSummary {

    private BigDecimal taxableAmount = BigDecimal.ZERO;
    private BigDecimal cgstAmount = BigDecimal.ZERO;
    private BigDecimal sgstAmount = BigDecimal.ZERO;
    private BigDecimal igstAmount = BigDecimal.ZERO;

    public void addTaxableAmount(BigDecimal value) {
        taxableAmount = taxableAmount.add(InvoicePdfStyles.safe(value));
    }

    public void addCgstAmount(BigDecimal value) {
        cgstAmount = cgstAmount.add(InvoicePdfStyles.safe(value));
    }

    public void addSgstAmount(BigDecimal value) {
        sgstAmount = sgstAmount.add(InvoicePdfStyles.safe(value));
    }

    public void addIgstAmount(BigDecimal value) {
        igstAmount = igstAmount.add(InvoicePdfStyles.safe(value));
    }

    public BigDecimal getTaxableAmount() {
        return taxableAmount;
    }

    public BigDecimal getCgstAmount() {
        return cgstAmount;
    }

    public BigDecimal getSgstAmount() {
        return sgstAmount;
    }

    public BigDecimal getIgstAmount() {
        return igstAmount;
    }

    public BigDecimal getTotalTax() {
        return cgstAmount.add(sgstAmount).add(igstAmount);
    }
}