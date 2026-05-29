package com.wilsonks.gstbilling.auth.identity;

import lombok.Data;

import java.util.List;

@Data
public class TenantUserCreateRequest {
    private String username;
    private String email;
    private String password;
    private List<String> roles;
    private Boolean active;
}