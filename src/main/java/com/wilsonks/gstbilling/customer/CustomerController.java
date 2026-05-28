package com.wilsonks.gstbilling.customer;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService service;

    @PostMapping
    public CustomerDto create(@RequestBody CustomerDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public CustomerDto update(@PathVariable Long id, @RequestBody CustomerDto dto) {
        return service.update(id, dto);
    }

    @GetMapping("/{id}")
    public CustomerDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    public Page<CustomerDto> list(
            @RequestParam(required = false) String q,
            Pageable pageable
    ) {
        return service.list(q, pageable);
    }

    @GetMapping("/mine")
    public List<CustomerDto> getAllForCurrentTenant() {
        return service.getAllForCurrentTenant();
    }

    @GetMapping("/stats")
    public CustomerStats stats() {
        return service.stats();
    }

    @PostMapping("/{id}/deactivate")
    public CustomerDto deactivate(@PathVariable Long id) {
        return service.deactivate(id);
    }

    @PostMapping("/{id}/reactivate")
    public CustomerDto reactivate(@PathVariable Long id) {
        return service.reactivate(id);
    }
}