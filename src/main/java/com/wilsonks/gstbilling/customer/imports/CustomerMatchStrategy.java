package com.wilsonks.gstbilling.customer.imports;

import com.wilsonks.gstbilling.customer.Customer;
import com.wilsonks.gstbilling.customer.CustomerDto;
import com.wilsonks.gstbilling.customer.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CustomerMatchStrategy {

    private final CustomerRepository repository;

    public Optional<Customer> findMatch(
            Long tenantId,
            CustomerDto dto) {

        if (dto.getId() != null) {

            Optional<Customer> byId =
                    repository.findByIdAndTenantId(
                            dto.getId(),
                            tenantId);

            if (byId.isPresent()) {
                return byId;
            }
        }

        if (dto.getCode() != null &&
                !dto.getCode().isBlank()) {

            Optional<Customer> byCode =
                    repository.findByTenantIdAndCodeIgnoreCase(
                            tenantId,
                            dto.getCode());

            if (byCode.isPresent()) {
                return byCode;
            }
        }

        if (dto.getGstin() != null &&
                !dto.getGstin().isBlank()) {

            return repository
                    .findByTenantIdAndGstinIgnoreCase(
                            tenantId,
                            dto.getGstin());
        }

        return Optional.empty();
    }
}