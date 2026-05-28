package com.wilsonks.gstbilling.invoice.sequence;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoice-sequences")
@RequiredArgsConstructor
public class InvoiceSequenceController {

    private final InvoiceSequenceService service;

    @PostMapping
    public InvoiceSequenceDto create(@RequestBody InvoiceSequenceDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public InvoiceSequenceDto update(@PathVariable Long id, @RequestBody InvoiceSequenceDto dto) {
        return service.update(id, dto);
    }

    @GetMapping("/{id}")
    public InvoiceSequenceDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/mine")
    public List<InvoiceSequenceDto> getForCurrentCompany() {
        return service.getForCurrentCompany();
    }

    @GetMapping
    public List<InvoiceSequenceDto> getForCurrentTenant() {
        return service.getForCurrentTenant();
    }

    @PostMapping("/next-number")
    public NextSequenceNumberDto nextNumber(@RequestParam DocumentType documentType) {
        return service.nextNumber(documentType);
    }

    @PostMapping("/{id}/deactivate")
    public InvoiceSequenceDto deactivate(@PathVariable Long id) {
        return service.deactivate(id);
    }

    @PostMapping("/{id}/reactivate")
    public InvoiceSequenceDto reactivate(@PathVariable Long id) {
        return service.reactivate(id);
    }
}