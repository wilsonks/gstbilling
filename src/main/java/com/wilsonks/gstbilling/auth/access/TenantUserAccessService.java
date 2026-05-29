package com.wilsonks.gstbilling.auth.access;

import com.wilsonks.gstbilling.auth.identity.Role;
import com.wilsonks.gstbilling.auth.identity.User;
import com.wilsonks.gstbilling.auth.identity.UserRepository;
import com.wilsonks.gstbilling.auth.identity.UserScope;
import com.wilsonks.gstbilling.company.Company;
import com.wilsonks.gstbilling.company.CompanyRepository;
import com.wilsonks.gstbilling.context.TenantContext;
import com.wilsonks.gstbilling.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TenantUserAccessService {

    private final UserAccessRepository userAccessRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    public TenantUserAccessDto create(TenantUserAccessCreateRequest request) {
        Long tenantId = getTenantIdOrThrow();
        validateCreate(request);

        User user = getTenantUserOrThrow(request.getUserId(), tenantId);
        Company company = getTenantCompanyOrThrow(request.getCompanyId(), tenantId);

        if (userAccessRepository.findByUserIdAndCompanyId(user.getId(), company.getId()).isPresent()) {
            throw new IllegalArgumentException("User access already exists for this company");
        }

        UserAccess access = new UserAccess();
        access.setUserId(user.getId());
        access.setCompanyId(company.getId());
        access.setTenantId(tenantId);
        access.setRole(request.getRole());
        access.setActive(request.getActive() == null || request.getActive());

        try {
            return toDto(userAccessRepository.save(access), user, company);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("User access already exists for this company");
        }
    }

    public TenantUserAccessDto update(Long id, TenantUserAccessUpdateRequest request) {
        Long tenantId = getTenantIdOrThrow();
        validateUpdate(request);

        UserAccess access = userAccessRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NotFoundException("User access not found: " + id));

        User user = getTenantUserOrThrow(access.getUserId(), tenantId);
        Company company = getTenantCompanyOrThrow(access.getCompanyId(), tenantId);

        access.setRole(request.getRole());
        if (request.getActive() != null) {
            access.setActive(request.getActive());
        }

        return toDto(userAccessRepository.save(access), user, company);
    }

    public TenantUserAccessDto getById(Long id) {
        Long tenantId = getTenantIdOrThrow();

        UserAccess access = userAccessRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NotFoundException("User access not found: " + id));

        User user = getTenantUserOrThrow(access.getUserId(), tenantId);
        Company company = getTenantCompanyOrThrow(access.getCompanyId(), tenantId);

        return toDto(access, user, company);
    }

    public Page<TenantUserAccessDto> list(Pageable pageable) {
        Long tenantId = getTenantIdOrThrow();

        return userAccessRepository.findByTenantId(tenantId, pageable)
                .map(this::toDto);
    }

    public List<TenantUserAccessDto> mine() {
        Long tenantId = getTenantIdOrThrow();

        return userAccessRepository.findByTenantId(tenantId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public TenantUserAccessStats stats() {
        Long tenantId = getTenantIdOrThrow();

        long total = userAccessRepository.countByTenantId(tenantId);
        long active = userAccessRepository.countByTenantIdAndActiveTrue(tenantId);
        long inactive = total - active;

        List<TenantUserAccessDto> recentAccess = userAccessRepository
                .findTop5ByTenantIdOrderByUpdatedAtDesc(tenantId)
                .stream()
                .map(this::toDto)
                .toList();

        return new TenantUserAccessStats(total, active, inactive, recentAccess);
    }

    public TenantUserAccessDto deactivate(Long id) {
        Long tenantId = getTenantIdOrThrow();

        UserAccess access = userAccessRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NotFoundException("User access not found: " + id));

        if (access.isActive()) {
            access.setActive(false);
            access = userAccessRepository.save(access);
        }

        return toDto(access);
    }

    public TenantUserAccessDto reactivate(Long id) {
        Long tenantId = getTenantIdOrThrow();

        UserAccess access = userAccessRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NotFoundException("User access not found: " + id));

        if (!access.isActive()) {
            access.setActive(true);
            access = userAccessRepository.save(access);
        }

        return toDto(access);
    }

    private Long getTenantIdOrThrow() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant in request context");
        }
        return tenantId;
    }

    private void validateCreate(TenantUserAccessCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("User access payload is required");
        }
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("User is required");
        }
        if (request.getCompanyId() == null) {
            throw new IllegalArgumentException("Company is required");
        }
        if (request.getRole() == null) {
            throw new IllegalArgumentException("Role is required");
        }
    }

    private void validateUpdate(TenantUserAccessUpdateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("User access payload is required");
        }
        if (request.getRole() == null) {
            throw new IllegalArgumentException("Role is required");
        }
    }

    private User getTenantUserOrThrow(Long userId, Long tenantId) {
        User user = userRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));

        if (user.getScope() != UserScope.TENANT) {
            throw new IllegalArgumentException("User is not a tenant user");
        }

        return user;
    }

    private Company getTenantCompanyOrThrow(Long companyId, Long tenantId) {
        return companyRepository.findByIdAndTenantId(companyId, tenantId)
                .orElseThrow(() -> new NotFoundException("Company not found: " + companyId));
    }

    private TenantUserAccessDto toDto(UserAccess access) {
        User user = getTenantUserOrThrow(access.getUserId(), access.getTenantId());
        Company company = getTenantCompanyOrThrow(access.getCompanyId(), access.getTenantId());
        return toDto(access, user, company);
    }

    private TenantUserAccessDto toDto(UserAccess access, User user, Company company) {
        TenantUserAccessDto dto = new TenantUserAccessDto();
        dto.setId(access.getId());
        dto.setUserId(access.getUserId());
        dto.setUsername(user.getUsername());
        dto.setUserEmail(user.getEmail());
        dto.setCompanyId(access.getCompanyId());
        dto.setCompanyName(company.getName());
        dto.setCompanyGstin(company.getGstin());
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
}