package com.wilsonks.gstbilling.auth.access;

import com.wilsonks.gstbilling.auth.identity.Role;
import lombok.Data;

import java.time.Instant;

@Data
public class UserAccessDto {
    private Long id;
    private Long userId;
    private Long companyId;
    private Long tenantId;
    private Role role;
    private boolean active;

    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;
    private Long version;
}