package com.wilsonks.gstbilling.product;

import com.wilsonks.gstbilling.product.imports.*;
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
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;

    private final ProductExportService exportService;

    private final ProductTemplateService templateService;

    private final ProductImportService importService;

    private final ProductImportErrorExportService errorExportService;


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
    public Page<ProductDto> list(@RequestParam(required = false) String q, Pageable pageable) {
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

    @PostMapping(value = "/import/validate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductImportValidationResult validate(@RequestParam("file") MultipartFile file) {

        return importService.validate(file);
    }

    @PostMapping(value = "/import/commit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductImportCommitResult commit(@RequestParam("file") MultipartFile file) {

        return importService.commit(file);
    }

    @GetMapping(value = "/template", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> template() {

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=product-template.xlsx").body(templateService.generateTemplate());
    }

    @GetMapping(value = "/export", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> export() {

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=products.xlsx").body(exportService.exportProducts());
    }

    @PostMapping(value = "/import/errors", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> downloadErrors(@RequestParam("file") MultipartFile file) {

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=product-import-errors.xlsx").body(errorExportService.exportErrors(file));
    }

}