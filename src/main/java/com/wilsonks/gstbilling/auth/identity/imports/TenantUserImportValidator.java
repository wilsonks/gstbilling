package com.wilsonks.gstbilling.auth.identity.imports;


import com.wilsonks.gstbilling.auth.identity.Role;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class TenantUserImportValidator {

    private final Set<String> allowedRoles = Arrays.stream(Role.values()).map(Enum::name).collect(Collectors.toSet());

    public List<String> validate(TenantUserImportDto dto) {

        List<String> errors = new ArrayList<>();

        if (dto == null) {

            errors.add("User row missing");

            return errors;
        }

        if (isBlank(dto.getUsername())) {
            errors.add("Username required");
        }

        if (isBlank(dto.getEmail())) {
            errors.add("Email required");
        }

        if (dto.getRoles() == null || dto.getRoles().isEmpty()) {

            errors.add("At least one role required");
        }

        if (dto.getRoles() != null) {

            Arrays.stream(dto.getRoles().split(",")).toList().forEach(role -> {

                if (!allowedRoles.contains(role.trim().toUpperCase())) {

                    errors.add("Invalid role: " + role);
                }
            });
        }

        return errors;
    }

    private boolean isBlank(String value) {

        return value == null || value.isBlank();
    }
}