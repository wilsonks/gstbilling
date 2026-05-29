package com.wilsonks.gstbilling.auth.identity;

import java.util.List;

public record TenantUserStats(
        long total,
        long active,
        long inactive,
        List<TenantUserDto> recentUsers
) {
}