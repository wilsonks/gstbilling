package com.wilsonks.gstbilling.invoice.sequence.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelErrorWorkbookBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class InvoiceSequenceImportErrorExportService {

    private final InvoiceSequenceImportService importService;

    private final InvoiceSequenceExcelDefinition excelDefinition;

    private final ExcelErrorWorkbookBuilder errorWorkbookBuilder;

    public byte[] exportErrors(MultipartFile file) {

        InvoiceSequenceImportValidationResult validation = importService.validate(file);

        if (validation.errors().isEmpty()) {

            throw new IllegalArgumentException("No validation errors found");
        }

        return errorWorkbookBuilder.buildErrorWorkbook(excelDefinition.columns(), validation.rows(), validation.errors());
    }
}