package com.wilsonks.gstbilling.auth.identity;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class UserValidator {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private static final Pattern USERNAME_PATTERN =
            Pattern.compile("^[a-z0-9._-]{3,50}$");

    public void validateForCreate(CreateUserRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("Request is required");
        }

        validateUsernameOrEmail(req.getUsername(), req.getEmail());
        validateEmail(req.getEmail());
        validatePasswordRequired(req.getPassword());
        validatePasswordStrength(req.getPassword());
    }

    public void validateForUpdate(UpdateUserRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("Request is required");
        }

        validateUsernameOrEmail(req.getUsername(), req.getEmail());
        validateEmail(req.getEmail());

        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            validatePasswordStrength(req.getPassword());
        }
    }

    private void validateUsernameOrEmail(String username, String email) {
        boolean hasUsername = username != null && !username.isBlank();
        boolean hasEmail = email != null && !email.isBlank();

        if (!hasUsername && !hasEmail) {
            throw new IllegalArgumentException("Username or email is required");
        }

        if (hasUsername) {
            String normalized = username.trim().toLowerCase();
            if (!USERNAME_PATTERN.matcher(normalized).matches()) {
                throw new IllegalArgumentException(
                        "Username must be 3-50 characters and contain only lowercase letters, numbers, dot, underscore, or hyphen"
                );
            }
        }
    }

    private void validateEmail(String email) {
        if (email == null || email.isBlank()) {
            return;
        }

        String normalized = email.trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException("Invalid email address");
        }
    }

    private void validatePasswordRequired(String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
    }

    private void validatePasswordStrength(String password) {
        String value = password == null ? "" : password.trim();

        if (value.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
    }
}