package com.wilsonks.gstbilling.invoice;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class InvoiceLineDto {
    private Long id;
    private Integer lineNo;

    private Long productId;
    private String productCode;
    private String productName;
    private String description;
    private String hsnSacCode;
    private String unitCode;

    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal taxableAmount;

    private BigDecimal gstRate;
    private BigDecimal cgstRate;
    private BigDecimal sgstRate;
    private BigDecimal igstRate;

    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;
    private BigDecimal lineTotalAmount;
}