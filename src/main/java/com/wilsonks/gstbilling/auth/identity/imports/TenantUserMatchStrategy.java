package com.wilsonks.gstbilling.auth.identity.imports;


import com.wilsonks.gstbilling.auth.identity.User;
import com.wilsonks.gstbilling.auth.identity.UserRepository;
import com.wilsonks.gstbilling.auth.identity.UserScope;
import com.wilsonks.gstbilling.context.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TenantUserMatchStrategy {

    private final UserRepository repository;

    public Optional<User> findMatch(TenantUserImportDto dto) {

        if (dto == null || dto.getUsername() == null || dto.getUsername().isBlank()) {

            return Optional.empty();
        }

        return repository
                .findByTenantIdAndScopeAndUsernameIgnoreCase(
                        TenantContext.get(),
                        UserScope.TENANT,
                        dto.getUsername().trim()
                );
    }
}