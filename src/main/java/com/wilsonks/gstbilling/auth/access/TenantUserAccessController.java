package com.wilsonks.gstbilling.auth.access;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-access")
@RequiredArgsConstructor
public class TenantUserAccessController {

    private final TenantUserAccessService service;

    @PostMapping
    public TenantUserAccessDto create(@RequestBody TenantUserAccessCreateRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public TenantUserAccessDto update(@PathVariable Long id, @RequestBody TenantUserAccessUpdateRequest request) {
        return service.update(id, request);
    }

    @GetMapping("/{id}")
    public TenantUserAccessDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    public Page<TenantUserAccessDto> list(Pageable pageable) {
        return service.list(pageable);
    }

    @GetMapping("/mine")
    public List<TenantUserAccessDto> mine() {
        return service.mine();
    }

    @GetMapping("/stats")
    public TenantUserAccessStats stats() {
        return service.stats();
    }

    @PostMapping("/{id}/deactivate")
    public TenantUserAccessDto deactivate(@PathVariable Long id) {
        return service.deactivate(id);
    }

    @PostMapping("/{id}/reactivate")
    public TenantUserAccessDto reactivate(@PathVariable Long id) {
        return service.reactivate(id);
    }
}