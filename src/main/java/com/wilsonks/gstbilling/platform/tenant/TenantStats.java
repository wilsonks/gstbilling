package com.wilsonks.gstbilling.platform.tenant;

import java.util.List;

public record TenantStats(
        long total,
        long active,
        long inactive,
        List<Tenant> recentTenants
) {
}

