package com.wilsonks.gstbilling.auth.identity.imports;


import com.wilsonks.gstbilling.auth.identity.*;
import com.wilsonks.gstbilling.bulk.excel.ExcelReadResult;
import com.wilsonks.gstbilling.bulk.excel.ExcelReader;
import com.wilsonks.gstbilling.bulk.excel.ExcelRowError;
import com.wilsonks.gstbilling.bulk.imports.ImportRowResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TenantUserImportService {

    private static final String DEFAULT_PASSWORD = "Temp@12345";

    private final ExcelReader excelReader;

    private final TenantUserExcelDefinition excelDefinition;

    private final TenantUserImportValidator validator;

    private final TenantUserDuplicateKeyProvider duplicateKeyProvider;

    private final TenantUserMatchStrategy matchStrategy;

    private final TenantUserService tenantUserService;

    public TenantUserImportValidationResult validate(MultipartFile file) {

        try {

            ExcelReadResult<TenantUserImportDto> readResult = excelReader.read(file.getInputStream(), TenantUserImportDto::new, excelDefinition.columns());

            Set<String> duplicateKeys = findDuplicateKeys(readResult);

            List<ImportRowResult<TenantUserImportDto>> rows = new ArrayList<>();

            List<ExcelRowError> allErrors = new ArrayList<>(readResult.errors());

            for (var row : readResult.rows()) {

                TenantUserImportDto dto = row.data();

                List<String> rowErrors = new ArrayList<>();

                if (dto != null) {

                    rowErrors.addAll(validator.validate(dto));

                    String key = duplicateKeyProvider.duplicateKey(dto);

                    if (key != null && duplicateKeys.contains(key)) {

                        rowErrors.add("Duplicate username found in uploaded file");
                    }
                }

                rows.add(new ImportRowResult<>(row.rowNumber(), rowErrors.isEmpty(), dto, row.rawValues(), rowErrors));

                rowErrors.forEach(error -> allErrors.add(new ExcelRowError(row.rowNumber(), "ROW", null, error)));
            }

            int validRows = (int) rows.stream().filter(ImportRowResult::valid).count();

            int invalidRows = rows.size() - validRows;

            return new TenantUserImportValidationResult(invalidRows == 0, rows.size(), validRows, invalidRows, rows, allErrors);

        } catch (Exception ex) {

            throw new IllegalStateException("Failed validating user import", ex);
        }
    }

    public TenantUserImportCommitResult commit(MultipartFile file) {

        TenantUserImportValidationResult validation = validate(file);

        if (!validation.valid()) {

            return new TenantUserImportCommitResult(validation.totalRows(), 0, 0, validation.invalidRows(), validation.errors());
        }

        int inserted = 0;
        int updated = 0;

        List<ExcelRowError> commitErrors = new ArrayList<>();

        for (ImportRowResult<TenantUserImportDto> row : validation.rows()) {

            try {

                TenantUserImportDto dto = row.data();

                Optional<User> existing = matchStrategy.findMatch(dto);

                if (existing.isPresent()) {

                    try {

                        tenantUserService.update(existing.get().getId(), toUpdateRequest(dto));

                        updated++;

                    } catch (Exception ex) {

                        log.error("Failed updating user={} id={}", dto.getUsername(), existing.get().getId(), ex);

                        throw ex;
                    }

                } else {

                    tenantUserService.create(toCreateRequest(dto), true);

                    inserted++;
                }

            } catch (Exception ex) {

                commitErrors.add(new ExcelRowError(row.rowNumber(), "ROW", null, ex.getMessage()));
            }
        }

        return new TenantUserImportCommitResult(validation.totalRows(), inserted, updated, commitErrors.size(), commitErrors);
    }

    private Set<String> findDuplicateKeys(ExcelReadResult<TenantUserImportDto> result) {

        Map<String, Integer> counts = new HashMap<>();

        for (var row : result.rows()) {

            if (row.data() == null) {
                continue;
            }

            String key = duplicateKeyProvider.duplicateKey(row.data());

            if (key == null) {
                continue;
            }

            counts.merge(key, 1, Integer::sum);
        }

        return counts.entrySet().stream().filter(e -> e.getValue() > 1).map(Map.Entry::getKey).collect(Collectors.toSet());
    }

    private List<String> parseRoles(String csv) {

        if (csv == null || csv.isBlank()) {

            return List.of();
        }

        /**
         * Trim whitespace, ignore blank entries, convert to uppercase, and remove duplicates
         * (Java 16+) returns an immutable list.
         */
        return Arrays.stream(csv.split(",")).map(String::trim).filter(s -> !s.isBlank()).map(String::toUpperCase).distinct().toList();
    }

    private TenantUserCreateRequest toCreateRequest(TenantUserImportDto dto) {

        TenantUserCreateRequest req = new TenantUserCreateRequest();

        req.setUsername(dto.getUsername());

        req.setEmail(dto.getEmail());

        req.setRoles(parseRoles(dto.getRoles()));

        req.setPassword(DEFAULT_PASSWORD);

        req.setActive(dto.getActive());

        return req;
    }

    private TenantUserUpdateRequest toUpdateRequest(TenantUserImportDto dto) {

        TenantUserUpdateRequest req = new TenantUserUpdateRequest();

        req.setEmail(dto.getEmail());

        req.setRoles(parseRoles(dto.getRoles()));

        req.setActive(dto.getActive());

        return req;
    }
}