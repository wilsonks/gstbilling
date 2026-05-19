package com.wilsonks.gstbilling.company;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/platform/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService service;

    @PostMapping
    public CompanyDto create(@RequestBody CompanyDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public CompanyDto update(@PathVariable Long id, @RequestBody CompanyDto dto) {
        return service.update(id, dto);
    }

    @GetMapping("/stats")
    public CompanyStats stats() {
        return service.stats();
    }

    @GetMapping("/{id}")
    public CompanyDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    public Page<CompanyDto> list(
            @RequestParam(required = false) String q,
            Pageable pageable
    ) {
        return service.list(q, pageable);
    }

    @PostMapping("/{id}/deactivate")
    public CompanyDto deactivate(@PathVariable Long id) {
        return service.deactivate(id);
    }

    @PostMapping("/{id}/reactivate")
    public CompanyDto reactivate(@PathVariable Long id) {
        return service.reactivate(id);
    }
}