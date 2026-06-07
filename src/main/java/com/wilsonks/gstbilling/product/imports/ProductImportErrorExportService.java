package com.wilsonks.gstbilling.product.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelErrorWorkbookBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ProductImportErrorExportService {

    private final ProductImportService importService;

    private final ProductExcelDefinition excelDefinition;

    private final ExcelErrorWorkbookBuilder errorWorkbookBuilder;

    public byte[] exportErrors(
            MultipartFile file) {

        ProductImportValidationResult validation =
                importService.validate(file);

        if (validation.errors().isEmpty()) {

            throw new IllegalArgumentException(
                    "No validation errors found");
        }

        return errorWorkbookBuilder.buildErrorWorkbook(
                excelDefinition.columns(),
                validation.rows(),
                validation.errors());
    }
}
