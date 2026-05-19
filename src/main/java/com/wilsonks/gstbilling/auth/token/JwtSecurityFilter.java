package com.wilsonks.gstbilling.auth.token;


import com.wilsonks.gstbilling.context.CompanyContext;
import com.wilsonks.gstbilling.context.TenantContext;
import com.wilsonks.gstbilling.auth.identity.User;
import com.wilsonks.gstbilling.auth.identity.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtSecurityFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepo;
    private final TokenBlacklistService blacklistService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {

            String header = request.getHeader("Authorization");

            if (header == null || !header.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = header.substring(7);

            // 🔥 1. Check blacklist FIRST
            if (blacklistService.isBlacklisted(token)) {
                log.warn("Blocked blacklisted token");
                SecurityContextHolder.clearContext();
                filterChain.doFilter(request, response);
                return;
            }

            // If the access token is expired or invalid, parsing will fail and the request proceeds unauthenticated.
            // The /api/auth/refresh endpoint is permitAll and uses the HttpOnly refresh-token cookie instead.

            // 🔥 2. Parse token
            Claims claims = jwtService.parseClaimsFromToken(token);

            String username = claims.getSubject();

            if (username == null) {
                log.warn("JWT without subject");
                filterChain.doFilter(request, response);
                return;
            }

            User user = userRepo.findByUsername(username).orElse(null);

            if (user == null) {
                log.warn("User not found for token: {}", username);
                SecurityContextHolder.clearContext();
                filterChain.doFilter(request, response);
                return;
            }

            // 🔥 3. Build authorities
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();

            if (user.getRoles() != null) {
                user.getRoles().forEach(role -> {
                    String formatted = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                    authorities.add(new SimpleGrantedAuthority(formatted));
                });
            }

            // 🔥 4. Scope-based roles
            String scope = claims.get("scope", String.class);

            if ("PLATFORM".equals(scope)) {
                String platformRole = claims.get("platformRole", String.class);
                if (platformRole != null && !platformRole.isBlank()) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + platformRole));
                }
            }

            // 🔥 5. Set authentication
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(user, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 🔥 6. Set Tenant + Company context (CRITICAL)
            if ("TENANT".equals(scope)) {

                Number companyIdClaim = claims.get("companyId", Number.class);
                Long companyId = companyIdClaim != null ? companyIdClaim.longValue() : null;

                Number tenantIdClaim = claims.get("tenantId", Number.class);
                Long tenantId = tenantIdClaim != null ? tenantIdClaim.longValue() : null;


                if (tenantId == null ) {
                    log.warn("Missing tenantId in token");
                    SecurityContextHolder.clearContext();
                    filterChain.doFilter(request, response);
                    return;
                } else {
                    TenantContext.set(tenantId);
                }

                if (companyId == null) {
                    log.warn("Missing companyId in token");
                    SecurityContextHolder.clearContext();
                    filterChain.doFilter(request, response);
                    return;
                } else {
                    CompanyContext.set(companyId);
                }
            }

        } catch (Exception ex) {
            log.debug("JWT filter error: {}", ex.getMessage(), ex);
            SecurityContextHolder.clearContext();
            TenantContext.clear();
            CompanyContext.clear();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Invalid or expired token\"}");
            return;
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            // 🔥 Prevent thread leakage
            TenantContext.clear();
            CompanyContext.clear(); // 🔥 ADD THIS
        }
    }
}