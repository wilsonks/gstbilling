package com.wilsonks.gstbilling.auth.access;

import com.wilsonks.gstbilling.auth.identity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAccessService {

    private final UserAccessRepository repo;
    private final UserAccessValidator validator;

    public Page<UserAccessDto> list(String q, Pageable pageable) {
        if (q == null || q.isBlank()) {
            return repo.findAll(pageable).map(this::toDto);
        }

        String query = q.trim();

        try {
            Long numeric = Long.valueOf(query);
            return repo.findByUserIdOrCompanyIdOrTenantId(numeric, numeric, numeric, pageable)
                    .map(this::toDto);
        } catch (NumberFormatException ex) {
            return Page.empty(pageable);
        }
    }

    public UserAccessDto getById(Long id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("User access not found: " + id));
    }

    public UserAccessDto create(CreateUserAccessRequest req) {
        validator.validateForCreate(req);

        UserAccess existing = repo.findByUserIdAndCompanyId(req.getUserId(), req.getCompanyId())
                .orElse(null);

        if (existing != null) {
            if (existing.isActive()) {
                throw new IllegalArgumentException("Active access already exists for this user and company");
            }

            existing.setTenantId(req.getTenantId());
            existing.setRole(req.getRole());
            existing.setActive(true);
            return toDto(repo.save(existing));
        }

        UserAccess access = new UserAccess();
        access.setUserId(req.getUserId());
        access.setCompanyId(req.getCompanyId());
        access.setTenantId(req.getTenantId());
        access.setRole(req.getRole());
        access.setActive(true);

        return toDto(repo.save(access));
    }

    public UserAccessDto update(Long id, UpdateUserAccessRequest req) {
        validator.validateForUpdate(req);

        UserAccess access = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User access not found: " + id));

        if (req.getTenantId() != null) {
            access.setTenantId(req.getTenantId());
        }

        if (req.getRole() != null) {
            access.setRole(req.getRole());
        }

        if (req.getActive() != null) {
            access.setActive(req.getActive());
        }

        return toDto(repo.save(access));
    }

    public UserAccessDto revoke(Long id) {
        UserAccess access = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User access not found: " + id));

        if (!access.isActive()) {
            throw new IllegalArgumentException("Access is already inactive");
        }

        access.setActive(false);
        return toDto(repo.save(access));
    }

    public List<UserAccessDto> getUserAccesses(Long userId) {
        return repo.findByUserIdAndActiveTrue(userId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<Long> getUserCompanies(Long userId) {
        return repo.findByUserIdAndActiveTrue(userId)
                .stream()
                .map(UserAccess::getCompanyId)
                .toList();
    }

    public UserAccessStats stats() {
        long total = repo.count();
        long active = repo.countByActiveTrue();
        long inactive = repo.countByActiveFalse();

        List<UserAccessDto> recentAccesses = repo.findAll(
                        PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "updatedAt"))
                )
                .stream()
                .map(this::toDto)
                .toList();

        return new UserAccessStats(total, active, inactive, recentAccesses);
    }

    private UserAccessDto toDto(UserAccess access) {
        UserAccessDto dto = new UserAccessDto();
        dto.setId(access.getId());
        dto.setUserId(access.getUserId());
        dto.setCompanyId(access.getCompanyId());
        dto.setTenantId(access.getTenantId());
        dto.setRole(access.getRole());
        dto.setActive(access.isActive());

        dto.setCreatedAt(access.getCreatedAt());
        dto.setUpdatedAt(access.getUpdatedAt());
        dto.setCreatedBy(access.getCreatedBy());
        dto.setUpdatedBy(access.getUpdatedBy());
        dto.setVersion(access.getVersion());

        return dto;
    }

    public Role getUserRoleForCompany(Long id, Long companyId) {
        return repo.findByUserIdAndCompanyIdAndActiveTrue(id, companyId)
                .map(UserAccess::getRole)
                .orElse(null);
    }
}