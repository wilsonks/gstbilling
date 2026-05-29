package com.wilsonks.gstbilling.company;

import java.util.List;

public record TenantCompanyStats(
        long total,
        long active,
        long inactive,
        List<CompanyDto> recentCompanies
) {
}