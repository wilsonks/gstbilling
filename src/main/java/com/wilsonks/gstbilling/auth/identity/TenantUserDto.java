package com.wilsonks.gstbilling.auth.identity;

import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class TenantUserDto {
    private Long id;
    private String username;
    private String email;
    private List<String> roles;
    private Long tenantId;
    private UserScope scope;
    private Boolean active;
    private boolean forcePasswordChange;

    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;
    private Long version;
}