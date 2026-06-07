package com.wilsonks.gstbilling.company.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelReadResult;
import com.wilsonks.gstbilling.bulk.excel.ExcelReader;
import com.wilsonks.gstbilling.bulk.excel.ExcelRowError;
import com.wilsonks.gstbilling.bulk.imports.ImportRowResult;
import com.wilsonks.gstbilling.company.Company;
import com.wilsonks.gstbilling.company.CompanyDto;
import com.wilsonks.gstbilling.company.TenantCompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyImportService {

    private final ExcelReader excelReader;

    private final CompanyExcelDefinition excelDefinition;

    private final CompanyImportValidator validator;

    private final CompanyDuplicateKeyProvider duplicateKeyProvider;

    private final CompanyMatchStrategy matchStrategy;

    private final TenantCompanyService companyService;

    public CompanyImportValidationResult validate(MultipartFile file) {

        try {

            ExcelReadResult<CompanyImportDto> readResult = excelReader.read(file.getInputStream(), CompanyImportDto::new, excelDefinition.columns());

            Set<String> duplicateKeys = findDuplicateKeys(readResult);

            List<ImportRowResult<CompanyImportDto>> rows = new ArrayList<>();

            List<ExcelRowError> allErrors = new ArrayList<>(readResult.errors());

            for (var row : readResult.rows()) {

                CompanyImportDto dto = row.data();

                List<String> rowErrors = new ArrayList<>();

                if (dto != null) {

                    rowErrors.addAll(validator.validate(dto));

                    String key = duplicateKeyProvider.duplicateKey(dto);

                    if (key != null && duplicateKeys.contains(key)) {

                        rowErrors.add("Duplicate GSTIN found in uploaded file");
                    }
                }

                rows.add(new ImportRowResult<>(row.rowNumber(), rowErrors.isEmpty(), dto, row.rawValues(), rowErrors));

                for (String error : rowErrors) {

                    allErrors.add(new ExcelRowError(row.rowNumber(), "ROW", null, error));
                }
            }

            int validRows = (int) rows.stream().filter(ImportRowResult::valid).count();

            int invalidRows = rows.size() - validRows;

            return new CompanyImportValidationResult(invalidRows == 0, rows.size(), validRows, invalidRows, rows, allErrors);

        } catch (Exception ex) {

            throw new IllegalStateException("Failed validating company import", ex);
        }
    }

    public CompanyImportCommitResult commit(MultipartFile file) {

        CompanyImportValidationResult validation = validate(file);

        if (!validation.valid()) {

            return new CompanyImportCommitResult(validation.totalRows(), 0, 0, validation.invalidRows(), validation.errors());
        }

        int inserted = 0;

        int updated = 0;

        List<ExcelRowError> errors = new ArrayList<>();

        for (ImportRowResult<CompanyImportDto> row : validation.rows()) {

            try {

                CompanyImportDto dto = row.data();

                CompanyDto companyDto = mapToCompanyDto(dto);

                Optional<Company> existing = matchStrategy.findMatch(dto);

                if (existing.isPresent()) {

                    companyService.update(existing.get().getId(), companyDto);

                    updated++;

                } else {

                    companyService.create(companyDto);

                    inserted++;
                }

            } catch (Exception ex) {

                errors.add(new ExcelRowError(row.rowNumber(), "ROW", null, ex.getMessage()));
            }
        }

        return new CompanyImportCommitResult(validation.totalRows(), inserted, updated, errors.size(), errors);
    }

    private Set<String> findDuplicateKeys(ExcelReadResult<CompanyImportDto> result) {

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

    private CompanyDto mapToCompanyDto(CompanyImportDto dto) {

        CompanyDto company = new CompanyDto();

        company.setId(dto.getId());

        company.setName(dto.getName());

        company.setLegalName(dto.getLegalName());

        company.setTradeName(dto.getTradeName());

        company.setGstin(dto.getGstin());

        company.setEmail(dto.getEmail());

        company.setPhone(dto.getPhone());

        company.setAddressLine1(dto.getAddressLine1());

        company.setAddressLine2(dto.getAddressLine2());

        company.setCity(dto.getCity());

        company.setState(dto.getState());

        company.setPincode(dto.getPincode());

        company.setCountry(dto.getCountry());

        company.setType(dto.getType());

        company.setActive(dto.getActive());

        return company;
    }
}