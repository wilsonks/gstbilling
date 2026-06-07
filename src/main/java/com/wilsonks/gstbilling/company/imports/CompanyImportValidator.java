package com.wilsonks.gstbilling.company.imports;

import com.wilsonks.gstbilling.company.CompanyType;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class CompanyImportValidator {

    private static final String GSTIN_REGEX =
            "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$";

    public List<String> validate(
            CompanyImportDto dto) {

        List<String> errors =
                new ArrayList<>();

        if (dto == null) {

            errors.add("Company row missing");

            return errors;
        }

        if (isBlank(dto.getName())) {
            errors.add("Company name required");
        }

        if (isBlank(dto.getGstin())) {
            errors.add("GSTIN required");
        }

        if (!isBlank(dto.getGstin())
                && !dto.getGstin()
                .trim()
                .toUpperCase()
                .matches(GSTIN_REGEX)) {

            errors.add("Invalid GSTIN");
        }

        if (dto.getType() == null) {
            errors.add("Company type required");
        }

        if (dto.getCountry() == null ||
                dto.getCountry().isBlank()) {

            dto.setCountry("India");
        }

        return errors;
    }

    private boolean isBlank(
            String value) {

        return value == null
                || value.isBlank();
    }
}