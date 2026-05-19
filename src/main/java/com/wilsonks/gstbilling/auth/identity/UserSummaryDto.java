package com.wilsonks.gstbilling.auth.identity;

import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class UserSummaryDto {
    private Long id;
    private String username;
    private String email;
    private Long tenantId;
    private UserScope scope;
    private List<String> roles;

    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;
    private Long version;
}