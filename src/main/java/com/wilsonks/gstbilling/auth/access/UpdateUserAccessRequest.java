package com.wilsonks.gstbilling.auth.access;

import com.wilsonks.gstbilling.auth.identity.Role;
import lombok.Data;

@Data
public class UpdateUserAccessRequest {
    private Long tenantId;
    private Role role;
    private Boolean active;
}