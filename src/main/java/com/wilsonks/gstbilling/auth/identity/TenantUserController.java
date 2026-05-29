package com.wilsonks.gstbilling.auth.identity;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class TenantUserController {

    private final TenantUserService service;

    @PostMapping
    public TenantUserDto create(@RequestBody TenantUserCreateRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public TenantUserDto update(@PathVariable Long id, @RequestBody TenantUserUpdateRequest request) {
        return service.update(id, request);
    }

    @GetMapping("/{id}")
    public TenantUserDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    public Page<TenantUserDto> list(
            @RequestParam(required = false) String q,
            Pageable pageable
    ) {
        return service.list(q, pageable);
    }

    @GetMapping("/mine")
    public List<TenantUserDto> mine() {
        return service.mine();
    }

    @GetMapping("/stats")
    public TenantUserStats stats() {
        return service.stats();
    }

    @PostMapping("/{id}/deactivate")
    public TenantUserDto deactivate(@PathVariable Long id) {
        return service.deactivate(id);
    }

    @PostMapping("/{id}/reactivate")
    public TenantUserDto reactivate(@PathVariable Long id) {
        return service.reactivate(id);
    }
}