package com.wilsonks.gstbilling.company;

import com.wilsonks.gstbilling.common.TenantScopedEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "t_tenant_companies")
public class Company extends TenantScopedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "legal_name", length = 200)
    private String legalName;

    @Column(name = "trade_name", length = 200)
    private String tradeName;

    @Column(nullable = false, length = 15, unique = true)
    private String gstin;

    @Column(length = 100)
    private String email;

    @Column(length = 10)
    private String pan;

    @Column(length = 2)
    private String stateCode;

    @Column(name = "address_line1", length = 200)
    private String addressLine1;

    @Column(name = "address_line2", length = 200)
    private String addressLine2;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 12)
    private String pincode;

    @Column(length = 100)
    private String country;

    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CompanyType type;

    @Column(nullable = false)
    private boolean active;
}