package com.wilsonks.gstbilling.auth.identity.imports;

import lombok.Data;

@Data
public class TenantUserExportRow {

    private String username;

    private String email;

    private String roles;

    private Boolean active;
}