package com.wilsonks.gstbilling.invoice.sequence.imports;

import com.wilsonks.gstbilling.company.Company;
import com.wilsonks.gstbilling.company.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InvoiceSequenceReferenceResolver {

    private final CompanyRepository companyRepository;

    public Long resolveCompanyId(String companyName) {

        if (companyName == null || companyName.isBlank()) {

            throw new IllegalArgumentException("Company name is required");
        }

        Company company = companyRepository.findByNameIgnoreCase(companyName.trim()).orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyName));

        return company.getId();
    }
}
