package com.wilsonks.gstbilling.auth.identity.imports;


import lombok.Data;

import java.util.List;

@Data
public class TenantUserImportDto {

    private String username;

    private String email;

    private String roles;

    private Boolean active;

    private Integer excelRowNumber;
}