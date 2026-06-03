package com.wilsonks.gstbilling.customer.imports;


import com.wilsonks.gstbilling.bulk.excel.DuplicateKeyProvider;
import com.wilsonks.gstbilling.customer.CustomerDto;
import org.springframework.stereotype.Component;

@Component
public class CustomerDuplicateKeyProvider
        implements DuplicateKeyProvider<CustomerDto> {

    @Override
    public String duplicateKey(
            CustomerDto dto) {

        if (dto.getCode() != null &&
                !dto.getCode().isBlank()) {

            return dto.getCode()
                    .trim()
                    .toUpperCase();
        }

        return null;
    }
}