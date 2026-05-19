package com.wilsonks.gstbilling.auth.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/platform/audit-logs")
@RequiredArgsConstructor
public class PlatformAuthAuditController {

    private final AuthAuditService service;

    @GetMapping
    public Page<AuthAuditDto> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) String ip,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime to,
            Pageable pageable
    ) {
        return service.list(q, username, action, companyId, ip, from, to, pageable);
    }

    @GetMapping("/stats")
    public AuthAuditStats stats() {
        return service.stats();
    }

    @GetMapping("/{id}")
    public AuthAuditDto getById(@PathVariable Long id) {
        return service.getById(id);
    }
}
