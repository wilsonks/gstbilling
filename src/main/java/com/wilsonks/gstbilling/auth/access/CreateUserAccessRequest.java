package com.wilsonks.gstbilling.auth.access;

import com.wilsonks.gstbilling.auth.identity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateUserAccessRequest {
    private Long userId;
    private Long companyId;
    private Long tenantId;
    private Role role;
}