package com.wilsonks.gstbilling.company.imports;

import org.springframework.stereotype.Component;

@Component
public class CompanyDuplicateKeyProvider {

    public String duplicateKey(
            CompanyImportDto dto) {

        if (dto == null
                || dto.getGstin() == null) {

            return null;
        }

        return dto.getGstin()
                .trim()
                .toUpperCase();
    }
}