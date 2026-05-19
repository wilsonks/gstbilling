package com.wilsonks.gstbilling.auth.audit;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AuthAuditDto {
    private Long id;
    private String username;
    private String action;
    private Long companyId;
    private String ip;
    private LocalDateTime timestamp;
}
