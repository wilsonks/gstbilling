package com.wilsonks.gstbilling.company;

import java.util.List;

public record CompanyStats(
        long total,
        long active,
        long inactive,
        List<CompanyDto> recentCompanies
) {
}
