package com.wilsonks.gstbilling.auth.identity.imports;


import org.springframework.stereotype.Component;

@Component
public class TenantUserDuplicateKeyProvider {

    public String duplicateKey(
            TenantUserImportDto dto) {

        if (dto == null
                || dto.getUsername() == null) {

            return null;
        }

        return dto.getUsername()
                .trim()
                .toUpperCase();
    }
}