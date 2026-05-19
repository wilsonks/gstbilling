package com.wilsonks.gstbilling.auth.identity;


import lombok.Data;

import java.util.List;

@Data
public class CreateUserRequest {
    private String username;
    private String email;
    private String password;
    private Long tenantId;
    private UserScope scope;
    private List<String> roles;
}