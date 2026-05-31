package com.wilsonks.gstbilling.auth;

import com.wilsonks.gstbilling.auth.identity.User;
import jakarta.security.auth.message.AuthException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest req, HttpServletRequest request, HttpServletResponse response) {
        return authService.register(req, request.getRemoteAddr(), response);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest req,
                              HttpServletRequest request,
                              HttpServletResponse response) throws AuthException {

        return authService.login(req, request.getRemoteAddr(), response);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@CookieValue(value = "refreshToken", required = false) String token,
                                HttpServletRequest request,
                                HttpServletResponse response) throws AuthException {

        if (token == null || token.isBlank()) {
            throw new AuthException("Missing refresh token");
        }

        return authService.refresh(token, response, request.getRemoteAddr());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(value = "refreshToken", required = false) String token,
                                    @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
                                    HttpServletRequest request,
                                    HttpServletResponse response) {

        return authService.logout(authorization, token, response, request.getRemoteAddr());
    }

    @PostMapping("/switch-company")
    public AuthResponse switchCompany(@RequestBody SwitchCompanyRequest req,
                                      HttpServletRequest request,
                                      Authentication authentication) throws AuthException {

        if (authentication == null || authentication.getPrincipal() == null) {
            throw new AuthException("Unauthorized");
        }

        if (req.getCompanyId() == null) {
            throw new AuthException("Company ID is required");
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof User user)) {
            throw new AuthException("Authenticated user not found");
        }

        log.info("User {} is switching to company {}", user.getUsername(), req.getCompanyId());
        return authService.switchCompany(user, req.getCompanyId(), request.getRemoteAddr());
    }
}