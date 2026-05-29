package com.wilsonks.gstbilling.company;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class TenantCompanyController {

    private final TenantCompanyService service;

    @PostMapping
    public CompanyDto create(@RequestBody CompanyDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public CompanyDto update(@PathVariable Long id, @RequestBody CompanyDto dto) {
        return service.update(id, dto);
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

    @GetMapping("/mine")
    public List<CompanyDto> mine() {
        return service.getMine();
    }

    @GetMapping("/stats")
    public TenantCompanyStats stats() {
        return service.stats();
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