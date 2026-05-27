package com.wilsonks.gstbilling.product;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;

    @PostMapping
    public ProductDto create(@RequestBody ProductDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public ProductDto update(@PathVariable Long id, @RequestBody ProductDto dto) {
        return service.update(id, dto);
    }

    @GetMapping("/{id}")
    public ProductDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    public Page<ProductDto> list(
            @RequestParam(required = false) String q,
            Pageable pageable
    ) {
        return service.list(q, pageable);
    }

    @GetMapping("/mine")
    public List<ProductDto> getAllForCurrentTenant() {
        return service.getAllForCurrentTenant();
    }

    @GetMapping("/stats")
    public ProductStats stats() {
        return service.stats();
    }

    @PostMapping("/{id}/deactivate")
    public ProductDto deactivate(@PathVariable Long id) {
        return service.deactivate(id);
    }

    @PostMapping("/{id}/reactivate")
    public ProductDto reactivate(@PathVariable Long id) {
        return service.reactivate(id);
    }
}