package com.wilsonks.gstbilling.tenant.party;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/masters/parties")
@RequiredArgsConstructor
public class PartyController {

    private final PartyService service;

    @PostMapping
    public PartyResponse create(@RequestBody PartyRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public PartyResponse update(@PathVariable Long id, @RequestBody PartyRequest req) {
        return service.update(id, req);
    }

    @GetMapping("/{id}")
    public PartyResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping
    public Page<PartyResponse> list(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Boolean active,
            Pageable pageable
    ) {
        return service.list(query, active, pageable);
    }

    @PatchMapping("/{id}/deactivate")
    public PartyResponse deactivate(@PathVariable Long id) {
        return service.deactivate(id);
    }

    @PatchMapping("/{id}/activate")
    public PartyResponse activate(@PathVariable Long id) {
        return service.activate(id);
    }
}