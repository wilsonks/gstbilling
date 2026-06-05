package com.wilsonks.gstbilling.customer;

import com.wilsonks.gstbilling.common.TenantScopedEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "t_customers",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_customers_tenant_code", columnNames = {"tenant_id", "code"}),
                @UniqueConstraint(name = "uk_customers_tenant_gstin", columnNames = {"tenant_id", "gstin"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer extends TenantScopedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(name = "legal_name", nullable = false, length = 200)
    private String legalName;

    @Column(name = "trade_name", length = 200)
    private String tradeName;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type", length = 30)
    private CustomerType customerType;

    @Enumerated(EnumType.STRING)
    @Column(name = "gst_registration_type", length = 30)
    private GstRegistrationType gstRegistrationType;

    @Column(length = 15)
    private String gstin;

    @Column(length = 10)
    private String pan;

    @Column(name = "contact_person", length = 120)
    private String contactPerson;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "billing_address_line1", length = 200)
    private String billingAddressLine1;

    @Column(name = "billing_address_line2", length = 200)
    private String billingAddressLine2;

    @Column(name = "billing_city", length = 100)
    private String billingCity;

    @Column(name = "billing_state", length = 100)
    private String billingState;

    @Column(name = "billing_state_code", length = 2)
    private String billingStateCode;

    @Column(name = "billing_pincode", length = 12)
    private String billingPincode;

    @Column(name = "billing_country", length = 100)
    private String billingCountry;

    @Column(name = "shipping_same_as_billing", nullable = false)
    private boolean shippingSameAsBilling;

    @Column(name = "shipping_address_line1", length = 200)
    private String shippingAddressLine1;

    @Column(name = "shipping_address_line2", length = 200)
    private String shippingAddressLine2;

    @Column(name = "shipping_city", length = 100)
    private String shippingCity;

    @Column(name = "shipping_state", length = 100)
    private String shippingState;

    @Column(name = "shipping_state_code", length = 2)
    private String shippingStateCode;

    @Column(name = "shipping_pincode", length = 12)
    private String shippingPincode;

    @Column(name = "shipping_country", length = 100)
    private String shippingCountry;

    @Column(name = "payment_terms_days")
    private Integer paymentTermsDays;

    @Column(nullable = false)
    private boolean active;
}