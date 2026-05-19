package com.wilsonks.gstbilling.auth;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.wilsonks.gstbilling.auth.identity.Role;
import com.wilsonks.gstbilling.company.CompanyDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response returned for:
 * - Register
 * - Login
 * - Refresh
 * - Switch Company
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // Exclude null fields (e.g., refreshToken in switch-company)
public class AuthResponse {

    // 🔐 JWT access token
    private String accessToken;

    // 🔁 Refresh token (nullable for switch-company)
    private String refreshToken;

    // 🔖 Token type (always Bearer)
    @Builder.Default
    private String tokenType = "Bearer";

    // 🏢 Current company context (GSTIN)
    private Long companyId;

    private List<CompanyDto> companies; // List of companies user has access to (for switch-company)

    // 🏷 Role in that company
    private Role role;

    // 👤 Username (optional, useful for UI)
    private String username;
}