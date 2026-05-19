package com.wilsonks.gstbilling.tenant;

import java.util.List;

public record TenantStats(
        long total,
        long active,
        long inactive,
        List<Tenant> recentTenants
) {
}

