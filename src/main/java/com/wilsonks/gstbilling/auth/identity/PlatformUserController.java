package com.wilsonks.gstbilling.auth.identity;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/platform/users")
@RequiredArgsConstructor
public class PlatformUserController {

    private final PlatformUserService service;

    @PostMapping
    public UserSummaryDto create(@RequestBody CreateUserRequest req) {
        return service.create(req);
    }

    @GetMapping("/stats")
    public UserStats stats() {
        return service.stats();
    }

    @GetMapping("/{id}")
    public UserSummaryDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    public Page<UserSummaryDto> list(
            @RequestParam(required = false) String q,
            Pageable pageable
    ) {
        return service.list(q, pageable);
    }

    @PutMapping("/{id}")
    public UserSummaryDto update(@PathVariable Long id, @RequestBody UpdateUserRequest req) {
        return service.update(id, req);
    }
}
