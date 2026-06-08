package com.wilsonks.gstbilling.dashboard;

import com.wilsonks.gstbilling.dashboard.dto.DashboardAlertsResponse;
import com.wilsonks.gstbilling.dashboard.dto.DashboardRecentDocumentDto;
import com.wilsonks.gstbilling.dashboard.dto.DashboardSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public DashboardSummaryResponse getDashboardSummary() {
        return dashboardService.getDashboardSummary();
    }

    @GetMapping("/alerts")
    public DashboardAlertsResponse getAlerts() {
        return dashboardService.getAlerts();
    }

    @GetMapping("/recent-documents")
    public List<DashboardRecentDocumentDto> getRecentDocuments() {
        return dashboardService.getRecentDocuments();
    }
}
