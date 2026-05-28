package com.wilsonks.gstbilling.invoice;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService service;

    @PostMapping
    public InvoiceDto create(@RequestBody CreateInvoiceRequest request) {
        return service.create(request);
    }

    @GetMapping("/{id}")
    public InvoiceDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    public Page<InvoiceDto> list(
            @RequestParam(required = false) String q,
            Pageable pageable
    ) {
        return service.list(q, pageable);
    }

    @GetMapping("/stats")
    public InvoiceStats stats() {
        return service.stats();
    }

    @PostMapping("/{id}/cancel")
    public InvoiceDto cancel(@PathVariable Long id) {
        return service.cancel(id);
    }
}