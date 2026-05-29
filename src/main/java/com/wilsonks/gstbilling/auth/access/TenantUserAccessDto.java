package com.wilsonks.gstbilling.auth.access;

import com.wilsonks.gstbilling.auth.identity.Role;
import lombok.Data;

import java.time.Instant;

@Data
public class TenantUserAccessDto {
    private Long id;
    private Long userId;
    private String username;
    private String userEmail;

    private Long companyId;
    private String companyName;
    private String companyGstin;

    private Long tenantId;
    private Role role;
    private Boolean active;

    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;
    private Long version;
}