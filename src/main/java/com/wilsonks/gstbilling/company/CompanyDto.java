package com.wilsonks.gstbilling.company;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CompanyDto {
    private Long id;
    private String name;
    private String legalName;
    private String tradeName;
    private String gstin;
    private String pan;
    private String stateCode;

    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;
    private String country;

    private String email;
    private String phone;
    private CompanyType type;
    private Boolean active;
    private Long tenantId;

    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;
    private Long version;
}