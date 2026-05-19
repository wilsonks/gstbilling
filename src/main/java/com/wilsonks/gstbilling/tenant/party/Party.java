package com.wilsonks.gstbilling.tenant.party;

import com.wilsonks.gstbilling.common.TenantScopedEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "party")
@Getter
@Setter
public class Party extends TenantScopedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PartyType partyType;

    @Column(length = 15) // GSTIN length is 15
    private String gstin;

    @Column(length = 15)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(length = 200)
    private String addressLine1;

    @Column(length = 200)
    private String addressLine2;

    @Column(length = 100)
    private String city;

    @Column(length = 2)
    private String stateCode; // e.g. "29"

    @Column(length = 10)
    private String pincode;

    @Column(nullable = false)
    private boolean isActive = true;
}
