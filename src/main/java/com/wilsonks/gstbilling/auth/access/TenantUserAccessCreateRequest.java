package com.wilsonks.gstbilling.auth.access;

import com.wilsonks.gstbilling.auth.identity.Role;
import lombok.Data;

@Data
public class TenantUserAccessCreateRequest {
    private Long userId;
    private Long companyId;
    private Role role;
    private Boolean active;
}