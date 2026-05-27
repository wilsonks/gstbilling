package com.wilsonks.gstbilling.product;

import java.util.List;

public record ProductStats(
        long total,
        long active,
        long inactive,
        List<ProductDto> recentProducts
) {
}