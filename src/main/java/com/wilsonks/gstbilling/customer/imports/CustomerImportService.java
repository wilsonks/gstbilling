package com.wilsonks.gstbilling.customer.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelDuplicateValidator;
import com.wilsonks.gstbilling.bulk.excel.ExcelReadResult;
import com.wilsonks.gstbilling.bulk.excel.ExcelReader;
import com.wilsonks.gstbilling.bulk.excel.ExcelRowError;
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
import java.util.Optional;

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

    public CustomerImportValidationResult validate(
            MultipartFile file) {

        try {

            ExcelReadResult<CustomerDto> readResult =
                    excelReader.read(
                            file.getInputStream(),
                            CustomerDto::new,
                            excelDefinition.columns());

            List<ExcelRowError> errors =
                    new ArrayList<>(readResult.errors());

            errors.addAll(
                    duplicateValidator.validate(
                            readResult.rows(),
                            duplicateKeyProvider));

            for (CustomerDto dto : readResult.rows()) {

                errors.addAll(
                        importValidator.validate(dto));
            }

            int invalidRows =
                    (int) errors.stream()
                            .map(ExcelRowError::rowNumber)
                            .distinct()
                            .count();

            int validRows =
                    Math.max(
                            0,
                            readResult.totalRows() - invalidRows);

            return new CustomerImportValidationResult(
                    errors.isEmpty(),
                    readResult.totalRows(),
                    validRows,
                    invalidRows,
                    errors
            );

        } catch (IOException ex) {

            throw new IllegalStateException(
                    "Failed reading uploaded file",
                    ex);
        }
    }

    @Transactional
    public CustomerImportCommitResult commit(
            MultipartFile file) {

        CustomerImportValidationResult validation =
                validate(file);

        if (!validation.valid()) {

            throw new IllegalArgumentException(
                    "Import contains validation errors. Validate and fix errors before commit.");
        }

        try {

            Long tenantId =
                    getTenantIdOrThrow();

            ExcelReadResult<CustomerDto> readResult =
                    excelReader.read(
                            file.getInputStream(),
                            CustomerDto::new,
                            excelDefinition.columns());

            int inserted = 0;
            int updated = 0;
            int failed = 0;

            List<ExcelRowError> errors =
                    new ArrayList<>();

            for (CustomerDto dto : readResult.rows()) {

                try {

                    Optional<Customer> existing =
                            matchStrategy.findMatch(
                                    tenantId,
                                    dto);

                    if (existing.isPresent()) {

                        customerService.update(
                                existing.get().getId(),
                                dto);

                        updated++;

                    } else {

                        customerService.create(dto);

                        inserted++;
                    }

                } catch (Exception ex) {

                    failed++;

                    int rowNumber = -1;

                    try {

                        var method =
                                dto.getClass()
                                        .getMethod(
                                                "getExcelRowNumber");

                        Object value =
                                method.invoke(dto);

                        if (value instanceof Integer row) {

                            rowNumber = row;
                        }

                    } catch (Exception ignored) {
                    }

                    errors.add(
                            new ExcelRowError(
                                    rowNumber,
                                    "ROW",
                                    null,
                                    ex.getMessage()));

                    log.error(
                            "Failed importing customer row {}",
                            rowNumber,
                            ex);
                }
            }

            return new CustomerImportCommitResult(
                    readResult.totalRows(),
                    inserted,
                    updated,
                    failed,
                    errors
            );

        } catch (IOException ex) {

            throw new IllegalStateException(
                    "Failed reading uploaded file",
                    ex);
        }
    }

    private Long getTenantIdOrThrow() {

        Long tenantId =
                TenantContext.get();

        if (tenantId == null) {

            throw new IllegalStateException(
                    "No tenant in request context");
        }

        return tenantId;
    }
}