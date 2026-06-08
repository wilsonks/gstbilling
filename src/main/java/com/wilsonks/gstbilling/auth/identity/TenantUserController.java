package com.wilsonks.gstbilling.auth.identity;

import com.wilsonks.gstbilling.auth.identity.imports.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class TenantUserController {

    private final TenantUserService service;

    private final TenantUserImportService importService;

    private final TenantUserExportService exportService;

    private final TenantUserTemplateService templateService;

    private final TenantUserImportErrorExportService errorExportService;

    @PostMapping
    public TenantUserDto create(@RequestBody TenantUserCreateRequest request) {
        return service.create(request, false);
    }

    @PutMapping("/{id}")
    public TenantUserDto update(@PathVariable Long id, @RequestBody TenantUserUpdateRequest request) {
        return service.update(id, request);
    }

    @GetMapping("/{id}")
    public TenantUserDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    public Page<TenantUserDto> list(@RequestParam(required = false) String q, Pageable pageable) {
        return service.list(q, pageable);
    }

    //For a logged-in user changing their own password, use:
    @PostMapping("/change-password")
    public void changePassword(@RequestBody ChangePasswordRequest request) {

        service.changePassword(request);
    }

    //For a logged-in user changing their own profile, use:
    @GetMapping("/me")
    public TenantUserDto me() {
        return service.currentUserDto();
    }

    @GetMapping("/mine")
    public List<TenantUserDto> mine() {
        return service.mine();
    }

    @GetMapping("/stats")
    public TenantUserStats stats() {
        return service.stats();
    }

    @PostMapping("/{id}/deactivate")
    public TenantUserDto deactivate(@PathVariable Long id) {
        return service.deactivate(id);
    }

    @PostMapping("/{id}/reactivate")
    public TenantUserDto reactivate(@PathVariable Long id) {
        return service.reactivate(id);
    }


    //For Admin resetting another user's password, use:
    @PostMapping("/{id}/reset-password")
    public void resetPassword(@PathVariable Long id) {
        service.resetPassword(id);
    }

    @GetMapping(value = "/template", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> template() {

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=user-template.xlsx").body(templateService.generateTemplate());
    }

    @GetMapping(value = "/export", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> export() {

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users.xlsx").body(exportService.exportUsers());
    }

    @PostMapping("/import/validate")
    public TenantUserImportValidationResult validate(@RequestParam("file") MultipartFile file) {

        return importService.validate(file);
    }

    @PostMapping("/import/commit")
    public TenantUserImportCommitResult commit(@RequestParam("file") MultipartFile file) {

        return importService.commit(file);
    }

    @PostMapping(value = "/import/errors", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> downloadErrors(@RequestParam("file") MultipartFile file) {

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=user-import-errors.xlsx").body(errorExportService.exportErrors(file));
    }
}