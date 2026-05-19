package com.wilsonks.gstbilling.auth.access;


import java.util.List;

public record UserAccessStats(
        long total,
        long active,
        long inactive,
        List<UserAccessDto> recentAccesses
) {
}