package com.wilsonks.gstbilling.auth.identity;

import lombok.Data;

import java.util.List;

@Data
public class TenantUserUpdateRequest {
    private String email;
    private List<String> roles;
    private Boolean active;
}