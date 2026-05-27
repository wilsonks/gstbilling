package com.wilsonks.gstbilling.platform.billing;

import com.wilsonks.gstbilling.platform.billing.dto.PlatformBillingOverviewDto;

public interface PlatformBillingService {
    PlatformBillingOverviewDto getOverview(String period);
}