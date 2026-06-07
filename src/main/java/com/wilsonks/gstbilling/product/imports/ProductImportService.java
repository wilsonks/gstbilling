package com.wilsonks.gstbilling.product.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelReadResult;
import com.wilsonks.gstbilling.bulk.excel.ExcelReader;
import com.wilsonks.gstbilling.bulk.excel.ExcelRowError;
import com.wilsonks.gstbilling.bulk.imports.ImportRowResult;
import com.wilsonks.gstbilling.context.TenantContext;
import com.wilsonks.gstbilling.product.Product;
import com.wilsonks.gstbilling.product.ProductDto;
import com.wilsonks.gstbilling.product.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductImportService {

    private final ExcelReader excelReader;

    private final ProductExcelDefinition excelDefinition;

    private final ProductImportValidator validator;

    private final ProductDuplicateKeyProvider duplicateKeyProvider;

    private final ProductMatchStrategy matchStrategy;

    private final ProductService productService;

    public ProductImportValidationResult validate(MultipartFile file) {

        try {

            ExcelReadResult<ProductImportDto> readResult = excelReader.read(file.getInputStream(), ProductImportDto::new, excelDefinition.columns());

            Set<String> duplicateKeys = findDuplicateKeys(readResult);

            List<ImportRowResult<ProductImportDto>> rows = new ArrayList<>();

            List<ExcelRowError> allErrors = new ArrayList<>(readResult.errors());

            for (var row : readResult.rows()) {

                ProductImportDto dto = row.data();

                List<String> rowErrors = new ArrayList<>();

                if (dto != null) {

                    rowErrors.addAll(validator.validate(dto));

                    String key = duplicateKeyProvider.duplicateKey(dto);

                    if (key != null && duplicateKeys.contains(key)) {

                        rowErrors.add("Duplicate Product Code in file");
                    }
                }

                rows.add(new ImportRowResult<>(row.rowNumber(), rowErrors.isEmpty(), dto, row.rawValues(), rowErrors));

                rowErrors.forEach(error -> allErrors.add(new ExcelRowError(row.rowNumber(), "ROW", null, error)));
            }

            int validRows = (int) rows.stream().filter(ImportRowResult::valid).count();

            int invalidRows = rows.size() - validRows;

            return new ProductImportValidationResult(invalidRows == 0, rows.size(), validRows, invalidRows, rows, allErrors);

        } catch (Exception ex) {

            throw new IllegalStateException("Failed validating product import", ex);
        }
    }

    public ProductImportCommitResult commit(MultipartFile file) {

        ProductImportValidationResult validation = validate(file);

        if (!validation.valid()) {

            return new ProductImportCommitResult(validation.totalRows(), 0, 0, validation.invalidRows(), validation.errors());
        }

        Long tenantId = TenantContext.get();

        int inserted = 0;
        int updated = 0;

        List<ExcelRowError> commitErrors = new ArrayList<>();

        for (ImportRowResult<ProductImportDto> row : validation.rows()) {

            try {

                ProductImportDto dto = row.data();

                ProductDto productDto = mapToProductDto(dto);

                Optional<Product> existing = matchStrategy.findMatch(tenantId, dto);

                if (existing.isPresent()) {

                    productService.update(existing.get().getId(), productDto);

                    updated++;

                } else {

                    productService.create(productDto);

                    inserted++;
                }

            } catch (Exception ex) {

                commitErrors.add(new ExcelRowError(row.rowNumber(), "ROW", null, ex.getMessage()));
            }
        }

        return new ProductImportCommitResult(validation.totalRows(), inserted, updated, commitErrors.size(), commitErrors);
    }

    private Set<String> findDuplicateKeys(ExcelReadResult<ProductImportDto> result) {

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

        return counts.entrySet().stream().filter(e -> e.getValue() > 1).map(Map.Entry::getKey).collect(java.util.stream.Collectors.toSet());
    }

    private ProductDto mapToProductDto(ProductImportDto dto) {

        ProductDto product = new ProductDto();

        product.setId(dto.getId());

        product.setCode(dto.getCode());

        product.setName(dto.getName());

        product.setDescription(dto.getDescription());

        product.setDefaultPrice(dto.getDefaultPrice());

        product.setActive(dto.getActive());

        product.setHsnSacId(dto.getHsnSacId());

        product.setUnitId(dto.getUnitId());

        product.setGstSlabId(dto.getGstSlabId());

        return product;
    }
}