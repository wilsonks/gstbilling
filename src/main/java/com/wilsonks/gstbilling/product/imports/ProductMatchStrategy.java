package com.wilsonks.gstbilling.product.imports;

import com.wilsonks.gstbilling.product.Product;
import com.wilsonks.gstbilling.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ProductMatchStrategy {

    private final ProductRepository repository;

    public Optional<Product> findMatch(
            Long tenantId,
            ProductImportDto dto) {

        if (dto == null
                || dto.getCode() == null
                || dto.getCode().isBlank()) {

            return Optional.empty();
        }

        return repository
                .findByTenantIdAndCodeIgnoreCase(
                        tenantId,
                        dto.getCode().trim());
    }
}