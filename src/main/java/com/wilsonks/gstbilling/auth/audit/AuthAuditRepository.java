package com.wilsonks.gstbilling.auth.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AuthAuditRepository extends JpaRepository<AuthAudit, Long>, JpaSpecificationExecutor<AuthAudit> {
}