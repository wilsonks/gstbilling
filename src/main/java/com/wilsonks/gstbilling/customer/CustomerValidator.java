package com.wilsonks.gstbilling.customer;

import org.springframework.stereotype.Component;

@Component
public class CustomerValidator {

    public void validateForCreateOrUpdate(CustomerDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Customer payload is required");
        }

        if (dto.getCode() == null || dto.getCode().isBlank()) {
            throw new IllegalArgumentException("Customer code is required");
        }

        if (dto.getLegalName() == null || dto.getLegalName().isBlank()) {
            throw new IllegalArgumentException("Legal name is required");
        }

        if (dto.getCustomerType() == null) {
            throw new IllegalArgumentException("Customer type is required");
        }

        if (dto.getGstRegistrationType() == null) {
            throw new IllegalArgumentException("GST registration type is required");
        }

        if (dto.getPaymentTermsDays() == null) {
            throw new IllegalArgumentException("Payment terms days is required");
        }

        if (dto.getPaymentTermsDays() < 0) {
            throw new IllegalArgumentException("Payment terms days cannot be negative");
        }

        if (requiresGstin(dto.getGstRegistrationType())) {
            if (dto.getGstin() == null || dto.getGstin().isBlank()) {
                throw new IllegalArgumentException("GSTIN is required for selected registration type");
            }
        }

        if (Boolean.FALSE.equals(dto.getShippingSameAsBilling())) {
            if (dto.getShippingAddressLine1() == null || dto.getShippingAddressLine1().isBlank()) {
                throw new IllegalArgumentException("Shipping address line 1 is required when shipping differs from billing");
            }
            if (dto.getShippingStateCode() == null || dto.getShippingStateCode().isBlank()) {
                throw new IllegalArgumentException("Shipping state code is required when shipping differs from billing");
            }
        }
    }

    private boolean requiresGstin(GstRegistrationType type) {
        return type == GstRegistrationType.REGISTERED
                || type == GstRegistrationType.COMPOSITION
                || type == GstRegistrationType.SEZ;
    }
}