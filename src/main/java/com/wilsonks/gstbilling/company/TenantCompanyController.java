package com.wilsonks.gstbilling.company;

import com.wilsonks.gstbilling.company.imports.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class TenantCompanyController {

    private final TenantCompanyService service;

    private final CompanyImportService importService;

    private final CompanyExportService exportService;

    private final CompanyTemplateService templateService;

    private final CompanyImportErrorExportService errorExportService;

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
    public Page<CompanyDto> list(@RequestParam(required = false) String q, Pageable pageable) {
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

    @GetMapping(value = "/template", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> template() {

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=company-template.xlsx").body(templateService.generateTemplate());
    }

    @GetMapping(value = "/export", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> export() {

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=companies.xlsx").body(exportService.exportCompanies());
    }

    @PostMapping(value = "/import/errors", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> downloadErrors(@RequestParam("file") MultipartFile file) {

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=company-import-errors.xlsx").body(errorExportService.exportErrors(file));
    }

    @PostMapping("/import/validate")
    public CompanyImportValidationResult validate(@RequestParam("file") MultipartFile file) {

        return importService.validate(file);
    }

    @PostMapping("/import/commit")
    public CompanyImportCommitResult commit(@RequestParam("file") MultipartFile file) {

        return importService.commit(file);
    }
}