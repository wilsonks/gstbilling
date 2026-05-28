package com.wilsonks.gstbilling.company;

import com.wilsonks.gstbilling.exception.CompanyException;
import org.springframework.stereotype.Component;

@Component
public class CompanyValidator {

    private static final String GSTIN_REGEX =
            "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$";

    public void validateForCreateOrUpdate(CompanyDto d) {
        if (d.getName() == null || d.getName().isBlank()) {
            throw new CompanyException("Company name required");
        }

        if (d.getGstin() == null || d.getGstin().isBlank()) {
            throw new CompanyException("GSTIN required");
        }

        if (!d.getGstin().matches(GSTIN_REGEX)) {
            throw new CompanyException("Invalid GSTIN");
        }

        if (d.getType() == null) {
            throw new CompanyException("Company type required");
        }

        if (d.getTenantId() == null) {
            throw new CompanyException("Tenant ID required");
        }

        d.setStateCode(d.getGstin().substring(0, 2));
        d.setPan(d.getGstin().substring(2, 12));

        if (d.getCountry() == null || d.getCountry().isBlank()) {
            d.setCountry("India");
        }
    }
}