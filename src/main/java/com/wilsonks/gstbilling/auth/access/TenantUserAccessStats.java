package com.wilsonks.gstbilling.auth.access;

import java.util.List;

public record TenantUserAccessStats(
        long total,
        long active,
        long inactive,
        List<TenantUserAccessDto> recentAccess
) {
}