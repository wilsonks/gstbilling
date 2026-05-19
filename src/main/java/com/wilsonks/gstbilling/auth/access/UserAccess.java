package com.wilsonks.gstbilling.auth.access;


import com.wilsonks.gstbilling.auth.identity.Role;
import com.wilsonks.gstbilling.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table( name = "t_user_access",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "company_id"})
        },
        indexes = {
                @Index(name = "idx_user_access_user_id", columnList = "user_id"),
                @Index(name = "idx_user_access_company_id", columnList = "company_id"),
                @Index(name = "idx_user_access_tenant_id", columnList = "tenant_id"),
                @Index(name = "idx_user_access_tenant_active", columnList = "tenant_id, active")
        }
)
public class UserAccess extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean active = true;
}