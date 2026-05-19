package com.wilsonks.gstbilling.auth.token;

import com.wilsonks.gstbilling.auth.identity.PlatformRole;
import com.wilsonks.gstbilling.auth.identity.Role;
import com.wilsonks.gstbilling.auth.identity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private static final long ALLOWED_CLOCK_SKEW_SECONDS = 30L;

    private final JwtConfig config;
    private final SecretKey key;

    public JwtService(JwtConfig config) {
        this.config = config;

        // HS256 requires a sufficiently long secret (at least 32 bytes).
        this.key = Keys.hmacShaKeyFor(config.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User user, Long companyId, Role role) {
        long ttlMillis = config.accessTokenMinutes() * 60_000L; // 60,000 ms in a minute

        return Jwts.builder()
                .issuer(config.issuer())
                .subject(user.getUsername())
                .claim("scope", user.getScope().name())
                .claim("tenantId", user.getTenantId())
                .claim("companyId", companyId)
                .claim("role", role.name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ttlMillis))
                .signWith(key)
                .compact();
    }

    public String generatePlatformAccessToken(User user, PlatformRole platformRole) {
        long ttlMillis = config.accessTokenMinutes() * 60_000L;

        return Jwts.builder()
                .issuer(config.issuer())
                .subject(user.getUsername())
                .claim("scope", user.getScope().name())
                .claim("platformRole", platformRole.name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ttlMillis))
                .signWith(key)
                .compact();
    }

    public Claims parseClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .clockSkewSeconds(ALLOWED_CLOCK_SKEW_SECONDS)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Instant extractExpiration(String token) {
        Date exp = parseClaimsFromToken(token).getExpiration();
        return exp != null ? exp.toInstant() : Instant.EPOCH;
    }
}