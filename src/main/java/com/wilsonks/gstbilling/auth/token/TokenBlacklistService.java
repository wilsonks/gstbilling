package com.wilsonks.gstbilling.auth.token;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    // token -> expiry epoch millis (same as JWT exp)
    private final Map<String, Long> blacklist = new ConcurrentHashMap<>();

    public void blacklistUntil(String token, Instant jwtExpiresAt) {
        if (token == null || token.isBlank() || jwtExpiresAt == null) return;

        long expMillis = jwtExpiresAt.toEpochMilli();
        long now = System.currentTimeMillis();

        // If token is already expired, don't store it
        if (expMillis <= now) return;

        blacklist.put(token, expMillis);
    }

    public boolean isBlacklisted(String token) {
        if (token == null || token.isBlank()) return false;

        Long expMillis = blacklist.get(token);
        if (expMillis == null) return false;

        // If blacklist entry is expired, remove it
        if (expMillis <= System.currentTimeMillis()) {
            blacklist.remove(token);
            return false;
        }
        return true;
    }

    // Prevent unbounded growth
    @Scheduled(fixedDelay = 60_000)
    public void cleanup() {
        long now = System.currentTimeMillis();
        blacklist.entrySet().removeIf(e -> e.getValue() <= now);
    }
}