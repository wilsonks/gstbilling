package com.wilsonks.gstbilling.invoice.sequence.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelReadResult;
import com.wilsonks.gstbilling.bulk.excel.ExcelReader;
import com.wilsonks.gstbilling.bulk.excel.ExcelRowError;
import com.wilsonks.gstbilling.bulk.imports.ImportRowResult;
import com.wilsonks.gstbilling.context.TenantContext;
import com.wilsonks.gstbilling.invoice.sequence.InvoiceSequence;
import com.wilsonks.gstbilling.invoice.sequence.InvoiceSequenceDto;
import com.wilsonks.gstbilling.invoice.sequence.InvoiceSequenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceSequenceImportService {

    private final ExcelReader excelReader;

    private final InvoiceSequenceExcelDefinition excelDefinition;

    private final InvoiceSequenceReferenceResolver referenceResolver;

    private final InvoiceSequenceImportValidator validator;

    private final InvoiceSequenceDuplicateKeyProvider duplicateKeyProvider;

    private final InvoiceSequenceMatchStrategy matchStrategy;

    private final InvoiceSequenceService invoiceSequenceService;

    public InvoiceSequenceImportValidationResult validate(MultipartFile file) {

        try {

            ExcelReadResult<InvoiceSequenceImportDto> readResult = excelReader.read(file.getInputStream(), InvoiceSequenceImportDto::new, excelDefinition.columns());

            Set<String> duplicateKeys = findDuplicateKeys(readResult);

            List<ImportRowResult<InvoiceSequenceImportDto>> rows = new ArrayList<>();

            List<ExcelRowError> allErrors = new ArrayList<>(readResult.errors());

            for (var row : readResult.rows()) {

                InvoiceSequenceImportDto dto = row.data();

                List<String> rowErrors = new ArrayList<>();

                try {

                    if (dto != null) {

                        dto.setCompanyId(referenceResolver.resolveCompanyId(dto.getCompanyName()));

                        rowErrors.addAll(validateDto(dto));

                        String key = duplicateKeyProvider.duplicateKey(dto);

                        if (key != null && duplicateKeys.contains(key)) {

                            rowErrors.add("Duplicate sequence found in uploaded file");
                        }
                    }

                } catch (Exception ex) {

                    rowErrors.add(ex.getMessage());
                }

                rows.add(new ImportRowResult<>(row.rowNumber(), rowErrors.isEmpty(), dto, row.rawValues(), rowErrors));

                rowErrors.forEach(error -> allErrors.add(new ExcelRowError(row.rowNumber(), "ROW", null, error)));
            }

            int validRows = (int) rows.stream().filter(ImportRowResult::valid).count();

            int invalidRows = rows.size() - validRows;

            return new InvoiceSequenceImportValidationResult(invalidRows == 0, rows.size(), validRows, invalidRows, rows, allErrors);

        } catch (Exception ex) {

            throw new IllegalStateException("Failed validating invoice sequence import", ex);
        }
    }

    public InvoiceSequenceImportCommitResult commit(MultipartFile file) {

        InvoiceSequenceImportValidationResult validation = validate(file);

        if (!validation.valid()) {

            return new InvoiceSequenceImportCommitResult(validation.totalRows(), 0, 0, validation.invalidRows(), validation.errors());
        }

        int inserted = 0;

        int updated = 0;

        List<ExcelRowError> commitErrors = new ArrayList<>();

        for (ImportRowResult<InvoiceSequenceImportDto> row : validation.rows()) {

            try {

                InvoiceSequenceImportDto dto = row.data();

                InvoiceSequenceDto sequenceDto = mapToDto(dto);

                Optional<InvoiceSequence> existing = matchStrategy.findMatch(dto);

                if (existing.isPresent()) {

                    invoiceSequenceService.update(existing.get().getId(), sequenceDto);

                    updated++;

                } else {

                    invoiceSequenceService.create(sequenceDto);

                    inserted++;
                }

            } catch (Exception ex) {

                commitErrors.add(new ExcelRowError(row.rowNumber(), "ROW", null, ex.getMessage()));
            }
        }

        return new InvoiceSequenceImportCommitResult(validation.totalRows(), inserted, updated, commitErrors.size(), commitErrors);
    }

    private List<String> validateDto(InvoiceSequenceImportDto dto) {

        List<String> errors = new ArrayList<>();

        try {

            InvoiceSequenceDto target = mapToDto(dto);

            invoiceSequenceService.getClass(); // keep service injected

            errors.addAll(validator.validate(dto));

        } catch (Exception ex) {

            errors.add(ex.getMessage());
        }

        return errors;
    }

    private Set<String> findDuplicateKeys(ExcelReadResult<InvoiceSequenceImportDto> result) {

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

    private InvoiceSequenceDto mapToDto(InvoiceSequenceImportDto dto) {

        InvoiceSequenceDto target = new InvoiceSequenceDto();

        target.setId(dto.getId());

        target.setTenantId(TenantContext.get());

        target.setCompanyId(dto.getCompanyId());

        target.setDocumentType(dto.getDocumentType());

        target.setFinancialYear(dto.getFinancialYear());

        target.setPrefix(dto.getPrefix());

        target.setSuffix(dto.getSuffix());

        target.setPaddingLength(dto.getPaddingLength());

        target.setCurrentNumber(dto.getCurrentNumber());

        target.setResetPolicy(dto.getResetPolicy());

        target.setActive(dto.getActive());

        return target;
    }
}
