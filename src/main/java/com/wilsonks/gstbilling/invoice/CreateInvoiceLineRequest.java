package com.wilsonks.gstbilling.invoice;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateInvoiceLineRequest {
    private Long productId;
    private String description;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
}