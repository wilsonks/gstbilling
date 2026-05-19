package com.wilsonks.gstbilling.auth.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthAuditService {

    private final AuthAuditRepository repo;

    public void log(String username, String action, Long companyId, String ip) {
        AuthAudit a = new AuthAudit();
        a.setUsername(username);
        a.setAction(action);
        a.setCompanyId(companyId);
        a.setIp(ip);

        repo.save(a);
    }

    public Page<AuthAuditDto> list(
            String q,
            String username,
            String action,
            Long companyId,
            String ip,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable
    ) {
        Specification<AuthAudit> spec = Specification.allOf(
                AuthAuditSpecifications.qMatches(q),
                AuthAuditSpecifications.usernameContains(username),
                AuthAuditSpecifications.actionEquals(action),
                AuthAuditSpecifications.companyIdEquals(companyId),
                AuthAuditSpecifications.ipContains(ip),
                AuthAuditSpecifications.timestampGte(from),
                AuthAuditSpecifications.timestampLte(to)
        );

        Pageable effectivePageable =
                pageable.getSort().isSorted()
                        ? pageable
                        : PageRequest.of(
                        pageable.getPageNumber(),
                        pageable.getPageSize(),
                        Sort.by(Sort.Direction.DESC, "timestamp")
                );

        return repo.findAll(spec, effectivePageable).map(this::toDto);
    }

    public AuthAuditDto getById(Long id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Audit log not found: " + id));
    }

    public AuthAuditStats stats() {
        long total = repo.count();

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        long today = repo.count(
                AuthAuditSpecifications.timestampGte(startOfToday)
        );

        long uniqueUsers = repo.findAll().stream()
                .map(AuthAudit::getUsername)
                .filter(username -> username != null && !username.isBlank())
                .map(String::trim)
                .map(String::toLowerCase)
                .distinct()
                .count();

        List<AuthAuditDto> recent = repo.findAll(
                        PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "timestamp"))
                )
                .stream()
                .map(this::toDto)
                .toList();

        return new AuthAuditStats(total, today, uniqueUsers, recent);
    }

    private AuthAuditDto toDto(AuthAudit audit) {
        AuthAuditDto dto = new AuthAuditDto();
        dto.setId(audit.getId());
        dto.setUsername(audit.getUsername());
        dto.setAction(audit.getAction());
        dto.setCompanyId(audit.getCompanyId());
        dto.setIp(audit.getIp());
        dto.setTimestamp(audit.getTimestamp());
        return dto;
    }
}