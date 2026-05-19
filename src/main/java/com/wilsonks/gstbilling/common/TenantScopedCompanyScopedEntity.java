package com.wilsonks.gstbilling.common;


import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(CompanyEntityListener.class)
public abstract class TenantScopedCompanyScopedEntity extends TenantScopedEntity {
    @Column(name = "company_id", nullable = false, updatable = false, length = 64)
    private Long companyId;
}
