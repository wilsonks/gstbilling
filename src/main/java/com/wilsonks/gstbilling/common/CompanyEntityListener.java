package com.wilsonks.gstbilling.common;

import com.wilsonks.gstbilling.context.CompanyContext;
import jakarta.persistence.PrePersist;

public class CompanyEntityListener {

    @PrePersist
    public void setCompanyId(Object entity) {
        if (entity instanceof TenantScopedCompanyScopedEntity e) {
            if (e.getCompanyId() == null) {
                e.setCompanyId(CompanyContext.get());
            }
        }
    }
}
