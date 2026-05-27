package com.wilsonks.gstbilling.platform.billing.entity;

import com.wilsonks.gstbilling.platform.billing.model.PaymentMode;
import com.wilsonks.gstbilling.platform.billing.model.PaymentStatus;
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
        name = "subscription_payments",
        indexes = {
                @Index(name = "idx_subscription_payments_tenant_id", columnList = "tenant_id"),
                @Index(name = "idx_subscription_payments_invoice_id", columnList = "invoice_id"),
                @Index(name = "idx_subscription_payments_payment_date", columnList = "payment_date"),
                @Index(name = "idx_subscription_payments_status", columnList = "status"),
                @Index(name = "idx_subscription_payments_reference_no", columnList = "reference_no")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "invoice_id", nullable = false)
    private Long invoiceId;

    @Column(name = "amount_paid", nullable = false, precision = 19, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", length = 30)
    private PaymentMode paymentMode;

    @Column(name = "reference_no", length = 150)
    private String referenceNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PaymentStatus status;

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