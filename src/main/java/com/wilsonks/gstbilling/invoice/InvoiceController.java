package com.wilsonks.gstbilling.invoice;

import com.wilsonks.gstbilling.invoice.export.InvoicePdfExportService;
import com.wilsonks.gstbilling.invoice.export.InvoicePdfFile;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService service;
    private final InvoicePdfExportService invoicePdfExportService;

    @PostMapping
    public InvoiceDto create(@RequestBody CreateInvoiceRequest request) {
        return service.create(request);
    }

    @PostMapping("/{id}/convert-to-tax-invoice")
    public InvoiceDto convertToTaxInvoice(@PathVariable Long id) {
        return service.convertToTaxInvoice(id);
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

    @GetMapping("/{id}/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @PathVariable Long id,
            @RequestParam(defaultValue = "attachment") String disposition
    ) {
        InvoicePdfFile pdf = invoicePdfExportService.export(id);
        String safeDisposition = "inline".equalsIgnoreCase(disposition) ? "inline" : "attachment";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, safeDisposition + "; filename=\"" + pdf.fileName() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf.content());
    }
}