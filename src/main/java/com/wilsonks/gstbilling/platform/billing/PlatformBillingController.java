package com.wilsonks.gstbilling.platform.billing;

import com.wilsonks.gstbilling.platform.billing.dto.PlatformBillingOverviewDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/platform/billing")
@RequiredArgsConstructor
public class PlatformBillingController {

    private final PlatformBillingService billingService;

    @GetMapping("/overview")
    public PlatformBillingOverviewDto getOverview(
            @RequestParam(defaultValue = "this-month") String period
    ) {
        return billingService.getOverview(period);
    }
}