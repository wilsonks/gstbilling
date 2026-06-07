package com.wilsonks.gstbilling.customer.imports;


import com.wilsonks.gstbilling.bulk.excel.ExcelErrorWorkbookBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class CustomerImportErrorExportService {

    private final CustomerImportService customerImportService;

    private final CustomerExcelDefinition customerExcelDefinition;

    private final ExcelErrorWorkbookBuilder errorWorkbookBuilder;

    public byte[] exportErrors(
            MultipartFile file) {

        CustomerImportValidationResult validation =
                customerImportService.validate(file);

        if (validation.errors() == null
                || validation.errors().isEmpty()) {

            throw new IllegalArgumentException(
                    "No validation errors found");
        }

        return errorWorkbookBuilder.buildErrorWorkbook(
                customerExcelDefinition.columns(),
                validation.rows(),
                validation.errors()
        );
    }
}