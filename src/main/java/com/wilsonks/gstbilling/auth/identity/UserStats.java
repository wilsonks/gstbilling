package com.wilsonks.gstbilling.auth.identity;

import java.util.List;

public record UserStats(
        long total,
        long platformUsers,
        long tenantUsers,
        List<UserSummaryDto> recentUsers
) {
}