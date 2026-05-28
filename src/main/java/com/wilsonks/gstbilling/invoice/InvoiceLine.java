package com.wilsonks.gstbilling.invoice;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "t_invoice_lines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "line_no", nullable = false)
    private Integer lineNo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_code", length = 50)
    private String productCode;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(length = 500)
    private String description;

    @Column(name = "hsn_sac_code", nullable = false, length = 20)
    private String hsnSacCode;

    @Column(name = "unit_code", nullable = false, length = 20)
    private String unitCode;

    @Column(nullable = false, precision = 19, scale = 3)
    private BigDecimal quantity;

    @Column(name = "unit_price", nullable = false, precision = 19, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "taxable_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal taxableAmount;

    @Column(name = "gst_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal gstRate;

    @Column(name = "cgst_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal cgstRate;

    @Column(name = "sgst_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal sgstRate;

    @Column(name = "igst_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal igstRate;

    @Column(name = "cgst_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal cgstAmount;

    @Column(name = "sgst_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal sgstAmount;

    @Column(name = "igst_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal igstAmount;

    @Column(name = "line_total_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal lineTotalAmount;
}