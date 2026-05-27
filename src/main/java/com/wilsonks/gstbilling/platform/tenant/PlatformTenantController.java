package com.wilsonks.gstbilling.platform.tenant;


import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/platform/tenants")
@RequiredArgsConstructor
public class PlatformTenantController {

    private final TenantService service;

    // CREATE
    @PostMapping
    public Tenant create(@RequestBody CreateTenantRequest req) {
        return service.create(req);
    }

    // READ (one)
    @GetMapping("/{tenantId}")
    public Tenant get(@PathVariable Long tenantId) {
        return service.get(tenantId);
    }

    // READ (list, paged)
    @GetMapping
    public Page<Tenant> list(@RequestParam(required = false) String q, Pageable pageable) {
        return service.list(q, pageable);
    }

    @GetMapping("/stats")
    public TenantStats stats() {
        return service.stats();
    }


    // UPDATE
    @PutMapping("/{tenantId}")
    public Tenant update(@PathVariable Long tenantId, @RequestBody UpdateTenantRequest req) {
        return service.update(tenantId, req);
    }

    // SOFT DELETE
    @PostMapping("/{tenantId}/deactivate")
    public Tenant deactivate(@PathVariable Long tenantId) {
        return service.deactivate(tenantId);
    }

    // RESTORE
    @PostMapping("/{tenantId}/reactivate")
    public Tenant reactivate(@PathVariable Long tenantId) {
        return service.reactivate(tenantId);
    }
}