package com.wilsonks.gstbilling.auth.access;

import org.springframework.stereotype.Component;

@Component
public class UserAccessValidator {

    public void validateForCreate(CreateUserAccessRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("Request is required");
        }

        if (req.getUserId() == null) {
            throw new IllegalArgumentException("userId is required");
        }

        if (req.getCompanyId() == null) {
            throw new IllegalArgumentException("companyId is required");
        }

        if (req.getTenantId() == null) {
            throw new IllegalArgumentException("tenantId is required");
        }

        if (req.getRole() == null) {
            throw new IllegalArgumentException("role is required");
        }
    }

    public void validateForUpdate(UpdateUserAccessRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("Request is required");
        }

        if (req.getTenantId() == null && req.getRole() == null && req.getActive() == null) {
            throw new IllegalArgumentException("At least one field must be provided for update");
        }
    }
}
