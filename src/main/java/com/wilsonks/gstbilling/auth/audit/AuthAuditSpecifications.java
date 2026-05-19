package com.wilsonks.gstbilling.auth.audit;

import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public final class AuthAuditSpecifications {

    private AuthAuditSpecifications() {
    }

    public static Specification<AuthAudit> usernameContains(String username) {
        return (root, query, cb) ->
                username == null || username.isBlank()
                        ? null
                        : cb.like(cb.lower(root.get("username")), "%" + username.trim().toLowerCase() + "%");
    }

    public static Specification<AuthAudit> actionEquals(String action) {
        return (root, query, cb) ->
                action == null || action.isBlank()
                        ? null
                        : cb.equal(cb.lower(root.get("action")), action.trim().toLowerCase());
    }

    public static Specification<AuthAudit> companyIdEquals(Long companyId) {
        return (root, query, cb) ->
                companyId == null
                        ? null
                        : cb.equal(root.get("companyId"), companyId);
    }

    public static Specification<AuthAudit> ipContains(String ip) {
        return (root, query, cb) ->
                ip == null || ip.isBlank()
                        ? null
                        : cb.like(cb.lower(root.get("ip")), "%" + ip.trim().toLowerCase() + "%");
    }

    public static Specification<AuthAudit> timestampGte(LocalDateTime from) {
        return (root, query, cb) ->
                from == null
                        ? null
                        : cb.greaterThanOrEqualTo(root.get("timestamp"), from);
    }

    public static Specification<AuthAudit> timestampLte(LocalDateTime to) {
        return (root, query, cb) ->
                to == null
                        ? null
                        : cb.lessThanOrEqualTo(root.get("timestamp"), to);
    }

    public static Specification<AuthAudit> qMatches(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) {
                return null;
            }

            String pattern = "%" + q.trim().toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("username")), pattern),
                    cb.like(cb.lower(root.get("action")), pattern),
                    cb.like(cb.lower(root.get("ip")), pattern)
            );
        };
    }
}