package com.wilsonks.gstbilling.auth.audit;

import java.util.List;

public record AuthAuditStats(
        long total,
        long today,
        long uniqueUsers,
        List<AuthAuditDto> recent
) {
}