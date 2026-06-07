package com.wilsonks.gstbilling.customer.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelDuplicateValidator;
import com.wilsonks.gstbilling.bulk.excel.ExcelReadResult;
import com.wilsonks.gstbilling.bulk.excel.ExcelReadRow;
import com.wilsonks.gstbilling.bulk.excel.ExcelReader;
import com.wilsonks.gstbilling.bulk.excel.ExcelRowError;
import com.wilsonks.gstbilling.bulk.imports.ImportRowResult;
import com.wilsonks.gstbilling.context.TenantContext;
import com.wilsonks.gstbilling.customer.Customer;
import com.wilsonks.gstbilling.customer.CustomerDto;
import com.wilsonks.gstbilling.customer.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerImportService {

    private final ExcelReader excelReader;

    private final ExcelDuplicateValidator duplicateValidator;

    private final CustomerExcelDefinition excelDefinition;

    private final CustomerDuplicateKeyProvider duplicateKeyProvider;

    private final CustomerImportValidator importValidator;

    private final CustomerMatchStrategy matchStrategy;

    private final CustomerService customerService;

    public CustomerImportValidationResult validate(MultipartFile file) {

        try {

            //step 1. read and validate excel, separate valid and invalid rows
            ExcelReadResult<CustomerDto> readResult = excelReader.read(file.getInputStream(), CustomerDto::new, excelDefinition.columns());

            List<ExcelRowError> allErrors = new ArrayList<>(readResult.errors());

            List<CustomerDto> validDtos = readResult.rows().stream().map(ExcelReadRow::data).filter(Objects::nonNull).toList();

            List<ExcelRowError> duplicateErrors = duplicateValidator.validate(validDtos, duplicateKeyProvider);

            allErrors.addAll(duplicateErrors);

            Map<Integer, List<String>> duplicateErrorMap = duplicateErrors.stream().collect(Collectors.groupingBy(ExcelRowError::rowNumber, Collectors.mapping(ExcelRowError::message, Collectors.toList())));

            List<ImportRowResult<CustomerDto>> rows = new ArrayList<>();

            for (ExcelReadRow<CustomerDto> excelRow : readResult.rows()) {

                CustomerDto dto = excelRow.data();

                List<String> rowErrors = excelRow.errors().stream().map(ExcelRowError::message).collect(Collectors.toCollection(ArrayList::new));

                if (dto == null) {

                    rowErrors.addAll(duplicateErrorMap.getOrDefault(excelRow.rowNumber(), List.of()));

                    rows.add(new ImportRowResult<>(excelRow.rowNumber(), false, null, excelRow.rawValues(),  rowErrors));

                    continue;
                }

                List<ExcelRowError> validationErrors = importValidator.validate(dto);

                allErrors.addAll(validationErrors);

                rowErrors.addAll(validationErrors.stream().map(ExcelRowError::message).toList());

                rowErrors.addAll(duplicateErrorMap.getOrDefault(excelRow.rowNumber(), List.of()));

                rows.add(new ImportRowResult<>(excelRow.rowNumber(), rowErrors.isEmpty(), dto, excelRow.rawValues(), rowErrors));
            }

            int invalidRows = (int) rows.stream().filter(row -> !row.valid()).count();

            int validRows = rows.size() - invalidRows;

            return new CustomerImportValidationResult(allErrors.isEmpty(), readResult.totalRows(), validRows, invalidRows, allErrors, rows);

        } catch (IOException ex) {

            throw new IllegalStateException("Failed reading uploaded file", ex);
        }
    }

    @Transactional
    public CustomerImportCommitResult commit(MultipartFile file) {

        CustomerImportValidationResult validation = validate(file);

        if (!validation.valid()) {

            throw new IllegalArgumentException("Import contains validation errors. Fix validation errors before committing.");
        }

        try {

            Long tenantId = getTenantIdOrThrow();

            ExcelReadResult<CustomerDto> readResult = excelReader.read(file.getInputStream(), CustomerDto::new, excelDefinition.columns());

            int inserted = 0;
            int updated = 0;
            int failed = 0;

            List<ExcelRowError> errors = new ArrayList<>();

            for (ExcelReadRow<CustomerDto> excelRow : readResult.rows()) {

                CustomerDto dto = excelRow.data();

                if (dto == null) {
                    continue;
                }

                try {

                    Optional<Customer> existing = matchStrategy.findMatch(tenantId, dto);

                    if (existing.isPresent()) {

                        customerService.update(existing.get().getId(), dto);

                        updated++;

                    } else {

                        customerService.create(dto);

                        inserted++;
                    }

                } catch (Exception ex) {

                    failed++;

                    errors.add(new ExcelRowError(dto.getExcelRowNumber(), "ROW", null, ex.getMessage()));

                    log.error("Failed importing customer row {}", dto.getExcelRowNumber(), ex);
                }
            }

            return new CustomerImportCommitResult(readResult.totalRows(), inserted, updated, failed, errors);

        } catch (IOException ex) {

            throw new IllegalStateException("Failed reading uploaded file", ex);
        }
    }

    private Long getTenantIdOrThrow() {

        Long tenantId = TenantContext.get();

        if (tenantId == null) {

            throw new IllegalStateException("No tenant in request context");
        }

        return tenantId;
    }
}