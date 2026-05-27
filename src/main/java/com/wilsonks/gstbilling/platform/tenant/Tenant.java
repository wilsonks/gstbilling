package com.wilsonks.gstbilling.platform.tenant;

import com.wilsonks.gstbilling.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "t_tenants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tenant_id", nullable = false, updatable = false, length = 64)
    private Long tenantId;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "gstin", nullable = false, unique = true, length = 15)
    private String gstin;

    @Column(name = "contact_email", nullable = false, length = 100)
    private String contactEmail;

    @Column(name = "active", nullable = false)
    private boolean active;

}