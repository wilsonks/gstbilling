package com.wilsonks.gstbilling.product.imports;

import org.springframework.stereotype.Component;

@Component
public class ProductDuplicateKeyProvider {

    public String duplicateKey(
            ProductImportDto dto) {

        if (dto == null) {
            return null;
        }

        if (dto.getCode() == null) {
            return null;
        }

        return dto.getCode()
                .trim()
                .toUpperCase();
    }
}