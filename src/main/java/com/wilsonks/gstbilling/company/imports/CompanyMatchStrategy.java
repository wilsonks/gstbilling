package com.wilsonks.gstbilling.company.imports;

import com.wilsonks.gstbilling.company.Company;
import com.wilsonks.gstbilling.company.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CompanyMatchStrategy {

    private final CompanyRepository repository;

    public Optional<Company> findMatch(
            CompanyImportDto dto) {

        if (dto == null
                || dto.getGstin() == null
                || dto.getGstin().isBlank()) {

            return Optional.empty();
        }

        return repository.findByGstinIgnoreCase(
                dto.getGstin().trim());
    }
}
