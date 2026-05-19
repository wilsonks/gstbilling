package com.wilsonks.gstbilling.company;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CompanyDto {
    private Long id;
    private String name;
    private String gstin;
    private String pan;
    private String stateCode;
    private String address;
    private String email;
    private String phone;
    private CompanyType type;
    private Boolean active;
    private Long tenantId;
}