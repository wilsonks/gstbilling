package com.wilsonks.gstbilling.company.imports;

import com.wilsonks.gstbilling.company.CompanyType;
import lombok.Data;

@Data
public class CompanyImportDto {

    private Long id;

    private String name;

    private String legalName;

    private String tradeName;

    private String gstin;

    private String email;

    private String phone;

    private String addressLine1;

    private String addressLine2;

    private String city;

    private String state;

    private String pincode;

    private String country;

    private CompanyType type;

    private Boolean active;

    private Integer excelRowNumber;
}