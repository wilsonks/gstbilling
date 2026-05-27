package com.wilsonks.gstbilling.product;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class ProductValidator {

    public void validateForCreateOrUpdate(ProductDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Product payload is required");
        }

        if (dto.getCode() == null || dto.getCode().isBlank()) {
            throw new IllegalArgumentException("Product code is required");
        }

        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new IllegalArgumentException("Product name is required");
        }

        if (dto.getDefaultPrice() == null) {
            throw new IllegalArgumentException("Default price is required");
        }

        if (dto.getDefaultPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Default price cannot be negative");
        }

        if (dto.getHsnSacId() == null) {
            throw new IllegalArgumentException("HSN/SAC is required");
        }

        if (dto.getUnitId() == null) {
            throw new IllegalArgumentException("Unit is required");
        }

        if (dto.getGstSlabId() == null) {
            throw new IllegalArgumentException("GST slab is required");
        }
    }
}