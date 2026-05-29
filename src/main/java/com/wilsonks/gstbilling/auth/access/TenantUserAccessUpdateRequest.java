package com.wilsonks.gstbilling.auth.access;

import com.wilsonks.gstbilling.auth.identity.Role;
import lombok.Data;

@Data
public class TenantUserAccessUpdateRequest {
    private Role role;
    private Boolean active;
}