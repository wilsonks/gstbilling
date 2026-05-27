package com.wilsonks.gstbilling.platform.billing.entity;

import com.wilsonks.gstbilling.platform.billing.model.SubscriptionInvoiceStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(
        name = "subscription_invoices",
        indexes = {
                @Index(name = "idx_subscription_invoices_tenant_id", columnList = "tenant_id"),
                @Index(name = "idx_subscription_invoices_subscription_id", columnList = "subscription_id"),
                @Index(name = "idx_subscription_invoices_status", columnList = "status"),
                @Index(name = "idx_subscription_invoices_issued_on", columnList = "issued_on"),
                @Index(name = "idx_subscription_invoices_due_on", columnList = "due_on"),
                @Index(name = "idx_subscription_invoices_invoice_no", columnList = "invoice_no", unique = true)
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_no", nullable = false, unique = true, length = 100)
    private String invoiceNo;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "subscription_id", nullable = false)
    private Long subscriptionId;

    @Column(name = "period_label", length = 50)
    private String periodLabel;

    @Column(name = "amount_before_tax", nullable = false, precision = 19, scale = 2)
    private BigDecimal amountBeforeTax;

    @Column(name = "gst_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal gstAmount;

    @Column(name = "total_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "issued_on", nullable = false)
    private LocalDate issuedOn;

    @Column(name = "due_on", nullable = false)
    private LocalDate dueOn;

    @Column(name = "paid_on")
    private LocalDate paidOn;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SubscriptionInvoiceStatus status;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "version", nullable = false)
    private Long version;
}