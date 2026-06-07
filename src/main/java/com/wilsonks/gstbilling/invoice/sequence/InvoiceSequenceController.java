package com.wilsonks.gstbilling.invoice.sequence;

import com.wilsonks.gstbilling.invoice.sequence.imports.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/invoice-sequences")
@RequiredArgsConstructor
public class InvoiceSequenceController {

    private final InvoiceSequenceService service;

    private final InvoiceSequenceImportService importService;

    private final InvoiceSequenceExportService exportService;

    private final InvoiceSequenceTemplateService templateService;

    private final InvoiceSequenceImportErrorExportService errorExportService;

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


    @GetMapping(value = "/template", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> template() {

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-sequence-template.xlsx").body(templateService.generateTemplate());
    }

    @GetMapping(value = "/export", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> export() {

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-sequences.xlsx").body(exportService.exportSequences());
    }

    @PostMapping("/import/validate")
    public InvoiceSequenceImportValidationResult validate(@RequestParam("file") MultipartFile file) {

        return importService.validate(file);
    }

    @PostMapping("/import/commit")
    public InvoiceSequenceImportCommitResult commit(@RequestParam("file") MultipartFile file) {

        return importService.commit(file);
    }

    @PostMapping(value = "/import/errors", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> errors(@RequestParam("file") MultipartFile file) {

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-sequence-errors.xlsx").body(errorExportService.exportErrors(file));
    }

}