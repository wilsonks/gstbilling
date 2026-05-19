package com.wilsonks.gstbilling.auth.token;


import jakarta.security.auth.message.AuthException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository repo;

    // =========================
    // 🔥 CREATE REFRESH TOKEN
    // =========================
    public String create(Long userId, Long companyId) {

        String token = UUID.randomUUID().toString();

        RefreshToken rt = new RefreshToken();
        rt.setUserId(userId);
        rt.setCompanyId(companyId);
        rt.setToken(token);
        rt.setExpiry(LocalDateTime.now().plusDays(7));
        rt.setRevoked(false);

        repo.save(rt);

        return token;
    }

    // =========================
    // 🔍 VALIDATE REFRESH TOKEN
    // =========================
    public RefreshToken validate(String token) throws AuthException {

        log.info("Validating refresh token: {}", token);
        RefreshToken rt = repo.findByToken(token)
                .orElseThrow(() -> new AuthException("Invalid refresh token"));

        if (rt.isRevoked()) {
            throw new AuthException("Refresh token revoked");
        }

        if (rt.getExpiry().isBefore(LocalDateTime.now())) {
            throw new AuthException("Refresh token expired");
        }

        return rt;
    }

    // =========================
    // 🚫 REVOKE SINGLE TOKEN
    // =========================
    public void revoke(String token) {

        repo.findByToken(token).ifPresent(rt -> {
            rt.setRevoked(true);
            repo.save(rt);
        });
    }

    // =========================
    // 🚫 REVOKE ALL USER TOKENS
    // =========================
    public void revokeAllForUser(Long userId) {

        repo.findAll().stream()
                .filter(rt -> rt.getUserId().equals(userId))
                .forEach(rt -> {
                    rt.setRevoked(true);
                    repo.save(rt);
                });
    }

    // =========================
    // 🔁 ROTATE TOKEN (BEST PRACTICE)
    // =========================
    public String rotate(String oldToken) throws AuthException {

        RefreshToken existing = validate(oldToken);

        // revoke old
        existing.setRevoked(true);
        repo.save(existing);

        // create new
        return create(existing.getUserId(), existing.getCompanyId());
    }

    // =========================
    // 🧹 CLEANUP EXPIRED TOKENS
    // =========================
    public void cleanupExpired() {

        repo.findAll().stream()
                .filter(rt -> rt.getExpiry().isBefore(LocalDateTime.now()))
                .forEach(repo::delete);
    }
}
