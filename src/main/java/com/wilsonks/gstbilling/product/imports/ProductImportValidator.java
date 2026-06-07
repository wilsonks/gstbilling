package com.wilsonks.gstbilling.product.imports;

import com.wilsonks.gstbilling.master.gst.GstSlabMaster;
import com.wilsonks.gstbilling.master.hsn.HsnSacMaster;
import com.wilsonks.gstbilling.master.unit.UnitMaster;
import com.wilsonks.gstbilling.product.ProductDto;
import com.wilsonks.gstbilling.product.ProductValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ProductImportValidator {

    private final ProductValidator productValidator;

    private final ProductImportReferenceResolver referenceResolver;

    public List<String> validate(ProductImportDto dto) {

        List<String> errors = new ArrayList<>();

        validateRequiredFields(dto, errors);

        validatePrice(dto, errors);

        validateReferences(dto, errors);

        return errors;
    }

    private void validateRequiredFields(ProductImportDto dto, List<String> errors) {

        if (dto == null) {

            errors.add("Product row is missing");

            return;
        }

        if (isBlank(dto.getCode())) {

            errors.add("Product code is required");
        }

        if (isBlank(dto.getName())) {

            errors.add("Product name is required");
        }

        if (dto.getDefaultPrice() == null) {

            errors.add("Default price is required");
        }

        if (isBlank(dto.getHsnSacCode())) {

            errors.add("HSN/SAC code is required");
        }

        if (isBlank(dto.getUnitCode())) {

            errors.add("Unit code is required");
        }

        if (isBlank(dto.getGstSlabCode())) {

            errors.add("GST slab code is required");
        }
    }

    private void validatePrice(ProductImportDto dto, List<String> errors) {

        if (dto == null) {
            return;
        }

        BigDecimal price = dto.getDefaultPrice();

        if (price != null && price.compareTo(BigDecimal.ZERO) < 0) {

            errors.add("Default price cannot be negative");
        }
    }

    private void validateReferences(ProductImportDto dto, List<String> errors) {

        if (dto == null) {
            return;
        }

        try {

            HsnSacMaster hsnSac = referenceResolver.resolveHsnSac(dto.getHsnSacCode());

            dto.setHsnSacId(hsnSac.getId());

        } catch (Exception ex) {

            errors.add(ex.getMessage());
        }

        try {

            UnitMaster unit = referenceResolver.resolveUnit(dto.getUnitCode());

            dto.setUnitId(unit.getId());

        } catch (Exception ex) {

            errors.add(ex.getMessage());
        }

        try {

            GstSlabMaster gstSlab = referenceResolver.resolveGstSlab(dto.getGstSlabCode());

            dto.setGstSlabId(gstSlab.getId());

        } catch (Exception ex) {

            errors.add(ex.getMessage());
        }
    }

    private boolean isBlank(String value) {

        return value == null || value.isBlank();
    }
}