package com.wilsonks.gstbilling.customer;

import java.util.List;

public record CustomerStats(
        long total,
        long active,
        long inactive,
        List<CustomerDto> recentCustomers
) {
}