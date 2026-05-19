package com.wilsonks.gstbilling.auth.access;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/platform/user-access")
@RequiredArgsConstructor
public class PlatformUserAccessController {

    private final UserAccessService service;

    @GetMapping
    public Page<UserAccessDto> list(
            @RequestParam(required = false) String q,
            Pageable pageable
    ) {
        return service.list(q, pageable);
    }

    @GetMapping("/stats")
    public UserAccessStats stats() {
        return service.stats();
    }

    @GetMapping("/{id}")
    public UserAccessDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public UserAccessDto create(@RequestBody CreateUserAccessRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public UserAccessDto update(@PathVariable Long id, @RequestBody UpdateUserAccessRequest req) {
        return service.update(id, req);
    }

    @PostMapping("/{id}/revoke")
    public UserAccessDto revoke(@PathVariable Long id) {
        return service.revoke(id);
    }
}