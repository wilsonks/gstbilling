package com.wilsonks.gstbilling.auth.audit;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(
        name = "t_auth_audit",
        indexes = {
                @Index(name = "idx_auth_audit_username", columnList = "username"),
                @Index(name = "idx_auth_audit_action", columnList = "action"),
                @Index(name = "idx_auth_audit_company_id", columnList = "company_id"),
                @Index(name = "idx_auth_audit_ip", columnList = "ip"),
                @Index(name = "idx_auth_audit_timestamp", columnList = "timestamp")
        }
)
public class AuthAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String action;

    @Column(name = "company_id")
    private Long companyId;

    @Column
    private String ip;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
}