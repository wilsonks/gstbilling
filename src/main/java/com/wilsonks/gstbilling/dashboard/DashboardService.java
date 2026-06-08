package com.wilsonks.gstbilling.dashboard;

import com.wilsonks.gstbilling.dashboard.dto.DashboardAlertsResponse;
import com.wilsonks.gstbilling.dashboard.dto.DashboardRecentDocumentDto;
import com.wilsonks.gstbilling.dashboard.dto.DashboardSummaryResponse;

import java.util.List;

public interface DashboardService {

    DashboardSummaryResponse getDashboardSummary();

    DashboardAlertsResponse getAlerts();

    List<DashboardRecentDocumentDto> getRecentDocuments();

}