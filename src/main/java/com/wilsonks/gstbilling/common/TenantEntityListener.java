package com.wilsonks.gstbilling.common;


import com.wilsonks.gstbilling.context.TenantContext;

// PrePersist is a JPA annotation that is used to specify a callback method
// that should be invoked before an entity is persisted (saved) to the database. In this case, the
// setTenant method will be called before any entity that is being persisted, allowing you to set
// the tenant ID for that entity based on the current tenant context.
import jakarta.persistence.PrePersist;

public class TenantEntityListener {

    @PrePersist
    public void setTenantId(Object entity) {
        if (entity instanceof TenantScopedEntity e) {
            if (e.getTenantId() == null) {
                e.setTenantId(TenantContext.get());
            }
        }
    }
}