package com.wilsonks.gstbilling.auth.identity;

import com.wilsonks.gstbilling.auth.identity.imports.TenantUserImportDto;
import com.wilsonks.gstbilling.context.TenantContext;
import com.wilsonks.gstbilling.exception.NotFoundException;
import io.micrometer.common.KeyValues;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class TenantUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public TenantUserDto create(TenantUserCreateRequest request, boolean forcePasswordChange) {
        Long tenantId = getTenantIdOrThrow();
        normalizeCreate(request);
        validateCreate(request);

        if (userRepository.existsByUsernameIgnoreCase(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setScope(UserScope.TENANT);
        user.setTenantId(tenantId);
        user.setRoles(new ArrayList<>(request.getRoles()));
        user.setForcePasswordChange(forcePasswordChange);
        user.setActive(request.getActive() == null || request.getActive());

        try {
            return toDto(userRepository.save(user));
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("User could not be created due to duplicate data");
        }
    }

    public TenantUserDto update(Long id, TenantUserUpdateRequest request) {
        Long tenantId = getTenantIdOrThrow();
        normalizeUpdate(request);
        validateUpdate(request);

        User user = userRepository.findByIdAndTenantId(id, tenantId).orElseThrow(() -> new NotFoundException("User not found: " + id));

        if (user.getScope() != UserScope.TENANT) {
            throw new IllegalArgumentException("Only tenant users can be modified here");
        }
        user.setEmail(request.getEmail());
        user.setRoles(new ArrayList<>(request.getRoles()));
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        return toDto(userRepository.save(user));
    }

    public TenantUserDto getById(Long id) {
        Long tenantId = getTenantIdOrThrow();

        User user = userRepository.findByIdAndTenantId(id, tenantId).orElseThrow(() -> new NotFoundException("User not found: " + id));

        if (user.getScope() != UserScope.TENANT) {
            throw new IllegalArgumentException("User is not a tenant user");
        }

        return toDto(user);
    }

    public Page<TenantUserDto> list(String q, Pageable pageable) {
        Long tenantId = getTenantIdOrThrow();

        if (q == null || q.isBlank()) {
            return userRepository.findByTenantIdAndScope(tenantId, UserScope.TENANT, pageable).map(this::toDto);
        }

        String query = q.trim();
        return userRepository.findByTenantIdAndScopeAndUsernameContainingIgnoreCaseOrTenantIdAndScopeAndEmailContainingIgnoreCase(tenantId, UserScope.TENANT, query, tenantId, UserScope.TENANT, query, pageable).map(this::toDto);
    }

    public List<TenantUserDto> mine() {
        Long tenantId = getTenantIdOrThrow();

        return userRepository.findByTenantIdAndScope(tenantId, UserScope.TENANT).stream().map(this::toDto).toList();
    }

    public TenantUserStats stats() {
        Long tenantId = getTenantIdOrThrow();

        long total = userRepository.countByTenantIdAndScope(tenantId, UserScope.TENANT);
        long active = userRepository.countByTenantIdAndScopeAndActiveTrue(tenantId, UserScope.TENANT);
        long inactive = total - active;

        List<TenantUserDto> recentUsers = userRepository.findTop5ByTenantIdAndScopeOrderByUpdatedAtDesc(tenantId, UserScope.TENANT).stream().map(this::toDto).toList();

        return new TenantUserStats(total, active, inactive, recentUsers);
    }

    public TenantUserDto deactivate(Long id) {
        Long tenantId = getTenantIdOrThrow();

        User user = userRepository.findByIdAndTenantId(id, tenantId).orElseThrow(() -> new NotFoundException("User not found: " + id));

        if (user.getScope() != UserScope.TENANT) {
            throw new IllegalArgumentException("User is not a tenant user");
        }

        if (user.isActive()) {
            user.setActive(false);
            user = userRepository.save(user);
        }

        return toDto(user);
    }

    public TenantUserDto reactivate(Long id) {
        Long tenantId = getTenantIdOrThrow();

        User user = userRepository.findByIdAndTenantId(id, tenantId).orElseThrow(() -> new NotFoundException("User not found: " + id));

        if (user.getScope() != UserScope.TENANT) {
            throw new IllegalArgumentException("User is not a tenant user");
        }

        if (!user.isActive()) {
            user.setActive(true);
            user = userRepository.save(user);
        }

        return toDto(user);
    }


    public void changePassword(ChangePasswordRequest request) {

        User currentUser = currentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {

            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {

            throw new IllegalArgumentException("Passwords do not match");
        }

        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));

        currentUser.setForcePasswordChange(false);

        userRepository.save(currentUser);
    }


    private User currentUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null || !(authentication.getPrincipal() instanceof User)) {

            throw new IllegalStateException("No authenticated user found");
        }
        return (User) authentication.getPrincipal();
    }

    public TenantUserDto currentUserDto() {
        User user = currentUser();
        return toDto(user);
    }


    public static final String DEFAULT_PASSWORD = "Temp@12345";

    public void resetPassword(Long id) {

        Long tenantId = getTenantIdOrThrow();

        User user = userRepository.findByIdAndTenantId(id, tenantId).orElseThrow(() -> new NotFoundException("User not found: " + id));

        if (user.getScope() != UserScope.TENANT) {

            throw new IllegalArgumentException("User is not a tenant user");
        }

        user.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));

        user.setForcePasswordChange(true);

        userRepository.save(user);
    }

    private Long getTenantIdOrThrow() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant in request context");
        }
        return tenantId;
    }

    private void normalizeCreate(TenantUserCreateRequest request) {
        if (request.getUsername() != null) {
            request.setUsername(request.getUsername().trim());
        }
        if (request.getEmail() != null) {
            request.setEmail(request.getEmail().trim().toLowerCase(Locale.ROOT));
        }
    }

    private void normalizeUpdate(TenantUserUpdateRequest request) {
        if (request.getEmail() != null) {
            request.setEmail(request.getEmail().trim().toLowerCase(Locale.ROOT));
        }
    }

    private void validateCreate(TenantUserCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("User payload is required");
        }
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            throw new IllegalArgumentException("At least one role is required");
        }
    }

    private void validateUpdate(TenantUserUpdateRequest request) {
        if (request == null) {
            log.warn("Update request is null");
            throw new IllegalArgumentException("User payload is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            log.warn("Email is missing in update request");
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            log.warn("Roles are missing in update request");
            throw new IllegalArgumentException("At least one role is required");
        }
    }

    private List<String> normalizeRoles(List<String> roles) {
        return roles.stream().filter(r -> r != null && !r.isBlank()).map(r -> r.trim().toUpperCase(Locale.ROOT)).distinct().toList();
    }

    private TenantUserDto toDto(User user) {
        TenantUserDto dto = new TenantUserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRoles(user.getRoles());
        dto.setTenantId(user.getTenantId());
        dto.setScope(user.getScope());
        dto.setActive(user.isActive());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setCreatedBy(user.getCreatedBy());
        dto.setUpdatedBy(user.getUpdatedBy());
        dto.setVersion(user.getVersion());
        return dto;
    }

    public List<TenantUserImportDto> getMine() {
        Long tenantId = getTenantIdOrThrow();

        return userRepository.findByTenantIdAndScope(tenantId, UserScope.TENANT).stream().map(user -> {
            TenantUserImportDto dto = new TenantUserImportDto();
            dto.setUsername(user.getUsername());
            dto.setEmail(user.getEmail());
            dto.setRoles(String.join(",", user.getRoles()));
            return dto;
        }).toList();
    }
}