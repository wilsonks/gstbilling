package com.wilsonks.gstbilling.auth.identity;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlatformUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserValidator userValidator;

    public Page<UserSummaryDto> list(String q, Pageable pageable) {
        if (q == null || q.isBlank()) {
            return userRepository.findAll(pageable).map(this::toDto);
        }

        String query = q.trim();
        return userRepository
                .findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query, pageable)
                .map(this::toDto);
    }

    public UserSummaryDto getById(Long id) {
        return userRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    public UserSummaryDto create(CreateUserRequest req) {
        userValidator.validateForCreate(req);

        UserScope scope = req.getScope() != null ? req.getScope() : UserScope.TENANT;
        String email = normalizeEmail(req.getEmail());
        String username = normalizeUsername(req.getUsername(), email);
        List<String> roles = normalizeRoles(req.getRoles());

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Username already exists");
        }

        if (email != null && userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        validateScopeTenantAndRoles(scope, req.getTenantId(), roles);

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(req.getPassword()))
                .tenantId(scope == UserScope.PLATFORM ? null : req.getTenantId())
                .scope(scope)
                .roles(roles)
                .build();

        return toDto(userRepository.save(user));
    }

    public UserSummaryDto update(Long id, UpdateUserRequest req) {
        userValidator.validateForUpdate(req);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        String email = normalizeEmail(req.getEmail() != null ? req.getEmail() : user.getEmail());
        String username = normalizeUsername(
                req.getUsername() != null ? req.getUsername() : user.getUsername(),
                email
        );

        UserScope scope = req.getScope() != null ? req.getScope() : user.getScope();
        List<String> roles = req.getRoles() != null ? normalizeRoles(req.getRoles()) : user.getRoles();

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }

        if (!user.getUsername().equalsIgnoreCase(username)
                && userRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Username already exists");
        }

        if (email != null) {
            boolean emailChanged = user.getEmail() == null || !user.getEmail().equalsIgnoreCase(email);
            if (emailChanged && userRepository.existsByEmailIgnoreCase(email)) {
                throw new IllegalArgumentException("Email already exists");
            }
        }

        Long tenantId = scope == UserScope.PLATFORM
                ? null
                : (req.getTenantId() != null ? req.getTenantId() : user.getTenantId());

        validateScopeTenantAndRoles(scope, tenantId, roles);

        user.setUsername(username);
        user.setEmail(email);
        user.setScope(scope);
        user.setTenantId(tenantId);
        user.setRoles(roles);

        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }

        return toDto(userRepository.save(user));
    }

    public UserStats stats() {
        long total = userRepository.count();
        long platformUsers = userRepository.countByScope(UserScope.PLATFORM);
        long tenantUsers = userRepository.countByScope(UserScope.TENANT);

        List<UserSummaryDto> recentUsers = userRepository.findAll(
                        PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "updatedAt"))
                )
                .stream()
                .map(this::toDto)
                .toList();

        return new UserStats(total, platformUsers, tenantUsers, recentUsers);
    }

    private void validateScopeTenantAndRoles(UserScope scope, Long tenantId, List<String> roles) {
        if (scope == UserScope.PLATFORM) {
            if (tenantId != null) {
                throw new IllegalArgumentException("Platform user must not have tenantId");
            }

            Set<String> allowed = Arrays.stream(PlatformRole.values())
                    .map(Enum::name)
                    .collect(Collectors.toSet());

            for (String role : roles) {
                if (!allowed.contains(role)) {
                    throw new IllegalArgumentException(
                            "Invalid platform role: " + role + ". Allowed roles: " + allowed
                    );
                }
            }
            return;
        }

        if (scope == UserScope.TENANT) {
            if (tenantId == null) {
                throw new IllegalArgumentException("Tenant user must have tenantId");
            }

            Set<String> allowed = Arrays.stream(Role.values())
                    .map(Enum::name)
                    .collect(Collectors.toSet());

            for (String role : roles) {
                if (!allowed.contains(role)) {
                    throw new IllegalArgumentException(
                            "Invalid tenant role: " + role + ". Allowed roles: " + allowed
                    );
                }
            }
            return;
        }

        throw new IllegalArgumentException("Unsupported user scope: " + scope);
    }

    private List<String> normalizeRoles(List<String> roles) {
        if (roles == null) {
            return List.of();
        }

        return roles.stream()
                .filter(role -> role != null && !role.isBlank())
                .map(role -> role.trim().toUpperCase(Locale.ROOT))
                .distinct()
                .toList();
    }

    private String normalizeEmail(String email) {
        return email == null || email.isBlank()
                ? null
                : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeUsername(String username, String normalizedEmail) {
        if (username != null && !username.isBlank()) {
            return username.trim().toLowerCase(Locale.ROOT);
        }
        return UsernameUtil.generateUsernameFromEmail(normalizedEmail);
    }

    private UserSummaryDto toDto(User user) {
        UserSummaryDto dto = new UserSummaryDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setTenantId(user.getTenantId());
        dto.setScope(user.getScope());
        dto.setRoles(user.getRoles());

        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setCreatedBy(user.getCreatedBy());
        dto.setUpdatedBy(user.getUpdatedBy());
        dto.setVersion(user.getVersion());

        return dto;
    }
}