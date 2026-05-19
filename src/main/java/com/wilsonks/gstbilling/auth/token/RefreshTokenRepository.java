package com.wilsonks.gstbilling.auth.token;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findByUserId(Long userId);

    List<RefreshToken> findByUserIdAndCompanyId(Long userId, Long companyId);

    List<RefreshToken> findByExpiryBefore(LocalDateTime now);

    List<RefreshToken> findByUserIdAndRevokedFalse(Long userId);

    long countByUserIdAndRevokedFalse(Long userId);

    void deleteByExpiryBefore(LocalDateTime now);
}