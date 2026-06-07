package com.wilsonks.gstbilling.customer;

import com.wilsonks.gstbilling.customer.imports.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService service;
    private final CustomerImportService importService;
    private final CustomerImportErrorExportService errorExportService;
    private final CustomerExportService exportService;
    private final CustomerTemplateService templateService;

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
    public Page<CustomerDto> list(@RequestParam(required = false) String q, Pageable pageable) {
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


    @PostMapping(value = "/import/validate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CustomerImportValidationResult validateImport(@RequestParam("file") MultipartFile file) {

        return importService.validate(file);
    }

    @PostMapping(value = "/import/commit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CustomerImportCommitResult commitImport(@RequestParam("file") MultipartFile file) {

        return importService.commit(file);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export() {

        byte[] file = exportService.export();

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=customers.xlsx").contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).body(file);
    }

    @GetMapping("/template")
    public ResponseEntity<byte[]> template() {

        byte[] file = templateService.generateTemplate();

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=customer-template.xlsx").contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).body(file);
    }

    @PostMapping(value = "/import/errors", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> downloadErrors(@RequestParam("file") MultipartFile file) {

        byte[] bytes = errorExportService.exportErrors(file);

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=customer-import-errors.xlsx").contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).body(bytes);
    }

}