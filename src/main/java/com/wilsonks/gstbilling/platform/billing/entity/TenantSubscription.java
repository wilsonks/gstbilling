package com.wilsonks.gstbilling.platform.billing.entity;

import com.wilsonks.gstbilling.platform.billing.model.BillingCycle;
import com.wilsonks.gstbilling.platform.billing.model.SubscriptionStatus;
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
        name = "tenant_subscriptions",
        indexes = {
                @Index(name = "idx_tenant_subscriptions_tenant_id", columnList = "tenant_id"),
                @Index(name = "idx_tenant_subscriptions_status", columnList = "subscription_status"),
                @Index(name = "idx_tenant_subscriptions_next_renewal_date", columnList = "next_renewal_date"),
                @Index(name = "idx_tenant_subscriptions_active", columnList = "active")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false, unique = true)
    private Long tenantId;

    @Column(name = "plan_code", nullable = false, length = 50)
    private String planCode;

    @Column(name = "plan_name", nullable = false, length = 100)
    private String planName;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", nullable = false, length = 20)
    private BillingCycle billingCycle;

    @Column(name = "base_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal baseAmount;

    @Column(name = "gst_rate", nullable = false)
    private Integer gstRate;

    @Column(name = "mrr", nullable = false, precision = 19, scale = 2)
    private BigDecimal mrr;

    @Column(name = "arr", nullable = false, precision = 19, scale = 2)
    private BigDecimal arr;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_status", nullable = false, length = 20)
    private SubscriptionStatus subscriptionStatus;

    @Column(name = "started_at", nullable = false)
    private LocalDate startedAt;

    @Column(name = "renewed_at")
    private LocalDate renewedAt;

    @Column(name = "next_renewal_date")
    private LocalDate nextRenewalDate;

    @Column(name = "cancelled_at")
    private LocalDate cancelledAt;

    @Column(name = "active", nullable = false)
    private boolean active;

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