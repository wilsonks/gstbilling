package com.wilsonks.gstbilling.auth;

import com.wilsonks.gstbilling.auth.access.CreateUserAccessRequest;
import com.wilsonks.gstbilling.auth.access.UserAccessService;
import com.wilsonks.gstbilling.auth.audit.AuthAuditService;
import com.wilsonks.gstbilling.auth.identity.*;
import com.wilsonks.gstbilling.auth.token.JwtService;
import com.wilsonks.gstbilling.auth.token.RefreshToken;
import com.wilsonks.gstbilling.auth.token.RefreshTokenService;
import com.wilsonks.gstbilling.auth.token.TokenBlacklistService;
import com.wilsonks.gstbilling.company.CompanyDto;
import com.wilsonks.gstbilling.company.CompanyService;
import com.wilsonks.gstbilling.platform.tenant.CreateTenantRequest;
import com.wilsonks.gstbilling.platform.tenant.Tenant;
import com.wilsonks.gstbilling.platform.tenant.TenantService;
import io.jsonwebtoken.Claims;
import jakarta.security.auth.message.AuthException;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final long REFRESH_COOKIE_MAX_AGE = 7L * 24 * 60 * 60;

    private static final String ACTION_REGISTER_SUCCESS = "REGISTER_SUCCESS";
    private static final String ACTION_REGISTER_FAILED = "REGISTER_FAILED";
    private static final String ACTION_LOGIN_SUCCESS = "LOGIN_SUCCESS";
    private static final String ACTION_LOGIN_FAILED = "LOGIN_FAILED";
    private static final String ACTION_REFRESH_SUCCESS = "REFRESH_SUCCESS";
    private static final String ACTION_REFRESH_FAILED = "REFRESH_FAILED";
    private static final String ACTION_SWITCH_COMPANY_SUCCESS = "SWITCH_COMPANY_SUCCESS";
    private static final String ACTION_SWITCH_COMPANY_FAILED = "SWITCH_COMPANY_FAILED";
    private static final String ACTION_LOGOUT_SUCCESS = "LOGOUT_SUCCESS";

    private final PasswordEncoder passwordEncoder;
    private final UserRepository repository;
    private final UserAccessService userAccessService;
    private final AuthAuditService audit;
    private final JwtService jwtService;
    private final RefreshTokenService refreshService;
    private final TokenBlacklistService blacklistService;
    private final CompanyService companyService;
    private final TenantService tenantService;

    @Transactional
    public AuthResponse register(RegisterRequest req, String ip, HttpServletResponse response) {

        if (req.getEmail() == null || req.getEmail().isBlank()
                || req.getCompanyName() == null || req.getCompanyName().isBlank()
                || req.getGstin() == null || req.getGstin().isBlank()
                || req.getPassword() == null || req.getPassword().isBlank()) {
            throw new IllegalArgumentException("Email, password, company name and GSTIN must not be empty");
        }

        String email = req.getEmail().trim().toLowerCase();
        String companyName = req.getCompanyName().trim();
        String gstin = req.getGstin().trim().toUpperCase();
        String rawPassword = req.getPassword().trim();
        String baseUsername = UsernameUtil.generateUsernameFromEmail(email);
        if (baseUsername == null || baseUsername.isBlank()) {
            throw new IllegalArgumentException("Unable to generate username from email");
        }

        String username = baseUsername;
        int i = 2;
        while (repository.existsByUsername(username)) {
            username = baseUsername + i;
            i++;
        }

        if (rawPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }

        if (gstin.length() != 15) {
            throw new IllegalArgumentException("GSTIN must be 15 characters");
        }

        if (repository.findByEmailIgnoreCase(email).isPresent()) {
            auditEvent(email, ACTION_REGISTER_FAILED, null, ip);
            throw new IllegalArgumentException("Email already exists");
        }

        if (companyService.existsByGstin(gstin)) {
            auditEvent(username, ACTION_REGISTER_FAILED, null, ip);
            throw new IllegalArgumentException("Company with same GSTIN already exists");
        }



        Tenant tenant = tenantService.create(
                new CreateTenantRequest(
                        companyName,
                        gstin,
                        email,
                        true
                )
        );

        CompanyDto company = companyService.create(new CompanyDto(
                null, //Id
                companyName, //Name
                companyName, //Display name
                companyName,// Trade name
                gstin, //GSTIN
                null, //PAN
                null, //State code
                null, //Address line 1
                null, //Address line 2
                null, //City
                null, //State
                null, //Pin code
                null, //Country
                email, //email
                null, //Phone
                null, //company type
                true, //active
                tenant.getTenantId(), //tenant id
                null, //created at
                null, //updated at
                null, //created by
                null, //updated by
                null //version
        ));

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .tenantId(tenant.getTenantId())
                .scope(UserScope.TENANT)
                .roles(List.of("ADMIN"))
                .build();

        User savedUser = repository.save(user);

        userAccessService.create(new CreateUserAccessRequest(
                savedUser.getId(),
                company.getId(),
                tenant.getTenantId(),
                Role.ADMIN
        ));

        String accessToken =
                jwtService.generateAccessToken(savedUser, company.getId(), Role.ADMIN);
        String refreshToken =
                refreshService.create(savedUser.getId(), company.getId());

        response.addHeader("Set-Cookie", buildRefreshCookie(refreshToken).toString());

        auditEvent(savedUser.getUsername(), ACTION_REGISTER_SUCCESS, company.getId(), ip);

        return AuthResponse.builder()
                .username(savedUser.getUsername())
                .companyId(company.getId())
                .role(Role.ADMIN)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .companies(List.of(company))
                .build();
    }

    public AuthResponse login(LoginRequest req, String ip, HttpServletResponse response) throws AuthException {

        if (req.getEmail() == null || req.getEmail().isBlank()
                || req.getPassword() == null || req.getPassword().isBlank()) {
            throw new IllegalArgumentException("Email and password must not be empty");
        }

        String email = req.getEmail().trim().toLowerCase();
        String rawPassword = req.getPassword().trim();

        User user = repository.findByEmail(email).orElse(null);

        if (user == null || !passwordEncoder.matches(rawPassword, user.getPassword())) {
            auditEvent(email, ACTION_LOGIN_FAILED, null, ip);
            throw new AuthException("Invalid email or password");
        }

        if (user.getScope() == UserScope.PLATFORM) {
            PlatformRole pr = (user.getRoles() != null && user.getRoles().contains("SUPER_ADMIN"))
                    ? PlatformRole.SUPER_ADMIN
                    : PlatformRole.PLATFORM_ADMIN;

            String accessToken = jwtService.generatePlatformAccessToken(user, pr);
            String refreshToken = refreshService.create(user.getId(), null);

            response.addHeader("Set-Cookie", buildRefreshCookie(refreshToken).toString());

            auditEvent(user.getUsername(), ACTION_LOGIN_SUCCESS, null, ip);

            return AuthResponse.builder()
                    .username(user.getUsername())
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .build();
        }

        var accessList = userAccessService.getUserAccesses(user.getId());

        if (accessList.isEmpty()) {
            auditEvent(user.getUsername(), ACTION_LOGIN_FAILED, null, ip);
            throw new AuthException("No company access assigned");
        }

        var companies = accessList.stream()
                .map(a -> companyService.getById(a.getCompanyId()))
                .toList();

        var access = accessList.get(0);

        String accessToken =
                jwtService.generateAccessToken(user, access.getCompanyId(), access.getRole());

        String refreshToken =
                refreshService.create(user.getId(), access.getCompanyId());

        response.addHeader("Set-Cookie", buildRefreshCookie(refreshToken).toString());

        auditEvent(user.getUsername(), ACTION_LOGIN_SUCCESS, access.getCompanyId(), ip);

        return AuthResponse.builder()
                .username(user.getUsername())
                .companyId(access.getCompanyId())
                .role(access.getRole())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .companies(companies)
                .build();
    }

    public AuthResponse refresh(String refreshToken, HttpServletResponse response, String ip) throws AuthException {
        try {
            RefreshToken rt = refreshService.validate(refreshToken);

            User user = repository.findById(rt.getUserId())
                    .orElseThrow(() -> new AuthException("User not found"));

            if (user.getScope() == UserScope.PLATFORM) {
                PlatformRole pr = (user.getRoles() != null && user.getRoles().contains("SUPER_ADMIN"))
                        ? PlatformRole.SUPER_ADMIN
                        : PlatformRole.PLATFORM_ADMIN;

                String newRefreshToken = refreshService.rotate(refreshToken);
                response.addHeader("Set-Cookie", buildRefreshCookie(newRefreshToken).toString());

                String newAccessToken = jwtService.generatePlatformAccessToken(user, pr);

                auditEvent(user.getUsername(), ACTION_REFRESH_SUCCESS, null, ip);

                return AuthResponse.builder()
                        .username(user.getUsername())
                        .accessToken(newAccessToken)
                        .refreshToken(newRefreshToken)
                        .build();
            }

            var accessList = userAccessService.getUserAccesses(user.getId());

            if (accessList.isEmpty()) {
                auditEvent(user.getUsername(), ACTION_REFRESH_FAILED, rt.getCompanyId(), ip);
                throw new AuthException("No company access assigned");
            }

            var companies = accessList.stream()
                    .map(a -> companyService.getById(a.getCompanyId()))
                    .toList();

            Long companyId = rt.getCompanyId();
            if (companyId == null) {
                auditEvent(user.getUsername(), ACTION_REFRESH_FAILED, null, ip);
                throw new AuthException("Refresh token missing company context");
            }

            Role role = userAccessService.getUserRoleForCompany(user.getId(), companyId);

            String newRefreshToken = refreshService.rotate(refreshToken);
            response.addHeader("Set-Cookie", buildRefreshCookie(newRefreshToken).toString());

            String newAccessToken =
                    jwtService.generateAccessToken(user, companyId, role);

            auditEvent(user.getUsername(), ACTION_REFRESH_SUCCESS, companyId, ip);

            return AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .companyId(companyId)
                    .role(role)
                    .username(user.getUsername())
                    .companies(companies)
                    .build();
        } catch (AuthException ex) {
            auditEvent("UNKNOWN", ACTION_REFRESH_FAILED, null, ip);
            throw ex;
        }
    }

    public AuthResponse switchCompany(User user, Long companyId, String ip) throws AuthException {

        if (user == null || user.getId() == null) {
            throw new AuthException("User not found");
        }

        var accessList = userAccessService.getUserAccesses(user.getId());

        if (accessList.isEmpty()) {
            auditEvent(user.getUsername(), ACTION_SWITCH_COMPANY_FAILED, companyId, ip);
            throw new AuthException("No company access assigned");
        }

        var companies = accessList.stream()
                .map(a -> companyService.getById(a.getCompanyId()))
                .toList();

        try {
            Role role = userAccessService.getUserRoleForCompany(user.getId(), companyId);

            String accessToken =
                    jwtService.generateAccessToken(user, companyId, role);

            auditEvent(user.getUsername(), ACTION_SWITCH_COMPANY_SUCCESS, companyId, ip);

            return AuthResponse.builder()
                    .username(user.getUsername())
                    .companyId(companyId)
                    .role(role)
                    .accessToken(accessToken)
                    .companies(companies)
                    .build();
        } catch (RuntimeException ex) {
            auditEvent(user.getUsername(), ACTION_SWITCH_COMPANY_FAILED, companyId, ip);
            throw new AuthException("User does not have access to the requested company");
        }
    }

    public ResponseEntity<?> logout(String authorization, String refreshToken, HttpServletResponse response, String ip) {

        String usernameForAudit = null;
        Long companyForAudit = null;

        if (authorization != null && authorization.startsWith("Bearer ")) {
            String accessToken = authorization.substring(7);
            try {
                Claims claims = jwtService.parseClaimsFromToken(accessToken);
                usernameForAudit = claims.getSubject();
                companyForAudit = claims.get("companyId", Long.class);

                blacklistService.blacklistUntil(accessToken, jwtService.extractExpiration(accessToken));
            } catch (Exception ignored) {
            }
        }

        if (refreshToken != null && !refreshToken.isBlank()) {
            ResponseCookie clearCookie = ResponseCookie.from("refreshToken", "")
                    .httpOnly(true)
                    .secure(false)
                    .sameSite("Lax")
                    .path("/api/auth")
                    .maxAge(0)
                    .build();

            response.addHeader("Set-Cookie", clearCookie.toString());
            refreshService.revoke(refreshToken);
        }

        if (usernameForAudit != null) {
            auditEvent(usernameForAudit, ACTION_LOGOUT_SUCCESS, companyForAudit, ip);
        }

        return ResponseEntity.noContent().build();
    }

    private void auditEvent(String username, String action, Long companyId, String ip) {
        audit.log(
                username == null || username.isBlank() ? "UNKNOWN" : username,
                action,
                companyId,
                ip
        );
    }

    private ResponseCookie buildRefreshCookie(String refreshToken) {
        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(REFRESH_COOKIE_MAX_AGE)
                .build();
    }
}