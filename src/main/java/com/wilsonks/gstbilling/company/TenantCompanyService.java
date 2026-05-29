package com.wilsonks.gstbilling.company;

import com.wilsonks.gstbilling.context.TenantContext;
import com.wilsonks.gstbilling.exception.CompanyException;
import com.wilsonks.gstbilling.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class TenantCompanyService {

    private final CompanyRepository repo;
    private final CompanyValidator validator;

    public CompanyDto create(CompanyDto dto) {
        Long tenantId = getTenantIdOrThrow();

        normalize(dto);
        dto.setTenantId(tenantId);
        validator.validateForCreateOrUpdate(dto);

        if (repo.existsByGstinIgnoreCase(dto.getGstin())) {
            throw new CompanyException("Company with the same GSTIN already exists");
        }

        Company company = new Company();
        mapToEntity(dto, company, tenantId);

        try {
            return toDto(repo.save(company));
        } catch (DataIntegrityViolationException ex) {
            throw new CompanyException("Company with the same GSTIN already exists");
        }
    }

    public CompanyDto update(Long id, CompanyDto dto) {
        Long tenantId = getTenantIdOrThrow();

        Company company = repo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NotFoundException("Company not found: " + id));

        normalize(dto);
        dto.setTenantId(tenantId);
        validator.validateForCreateOrUpdate(dto);

        if (!dto.getGstin().equalsIgnoreCase(company.getGstin())
                && repo.existsByGstinIgnoreCase(dto.getGstin())) {
            throw new CompanyException("Company with the same GSTIN already exists");
        }

        mapToEntity(dto, company, tenantId);

        try {
            return toDto(repo.save(company));
        } catch (DataIntegrityViolationException ex) {
            throw new CompanyException("Company with the same GSTIN already exists");
        }
    }

    public CompanyDto getById(Long id) {
        Long tenantId = getTenantIdOrThrow();

        return repo.findByIdAndTenantId(id, tenantId)
                .map(this::toDto)
                .orElseThrow(() -> new NotFoundException("Company not found: " + id));
    }

    public Page<CompanyDto> list(String q, Pageable pageable) {
        Long tenantId = getTenantIdOrThrow();

        if (q == null || q.isBlank()) {
            return repo.findByTenantId(tenantId, pageable).map(this::toDto);
        }

        String query = q.trim();
        return repo.findByTenantIdAndNameContainingIgnoreCaseOrTenantIdAndGstinContainingIgnoreCase(
                        tenantId, query, tenantId, query, pageable
                )
                .map(this::toDto);
    }

    public List<CompanyDto> getMine() {
        Long tenantId = getTenantIdOrThrow();

        return repo.findByTenantIdAndActiveTrue(tenantId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public TenantCompanyStats stats() {
        Long tenantId = getTenantIdOrThrow();

        long total = repo.countByTenantId(tenantId);
        long active = repo.countByTenantIdAndActiveTrue(tenantId);
        long inactive = total - active;

        List<CompanyDto> recentCompanies = repo.findTop5ByTenantIdOrderByUpdatedAtDesc(tenantId)
                .stream()
                .map(this::toDto)
                .toList();

        return new TenantCompanyStats(total, active, inactive, recentCompanies);
    }

    public CompanyDto deactivate(Long id) {
        Long tenantId = getTenantIdOrThrow();

        Company company = repo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NotFoundException("Company not found: " + id));

        if (company.isActive()) {
            company.setActive(false);
            company = repo.save(company);
        }

        return toDto(company);
    }

    public CompanyDto reactivate(Long id) {
        Long tenantId = getTenantIdOrThrow();

        Company company = repo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NotFoundException("Company not found: " + id));

        if (!company.isActive()) {
            company.setActive(true);
            company = repo.save(company);
        }

        return toDto(company);
    }

    private Long getTenantIdOrThrow() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant in request context");
        }
        return tenantId;
    }

    private void normalize(CompanyDto dto) {
        if (dto.getName() != null) dto.setName(dto.getName().trim());
        if (dto.getLegalName() != null) dto.setLegalName(dto.getLegalName().trim());
        if (dto.getTradeName() != null) dto.setTradeName(dto.getTradeName().trim());
        if (dto.getGstin() != null) dto.setGstin(dto.getGstin().trim().toUpperCase(Locale.ROOT));
        if (dto.getEmail() != null) dto.setEmail(dto.getEmail().trim().toLowerCase(Locale.ROOT));
        if (dto.getPhone() != null) dto.setPhone(dto.getPhone().trim());
        if (dto.getAddressLine1() != null) dto.setAddressLine1(dto.getAddressLine1().trim());
        if (dto.getAddressLine2() != null) dto.setAddressLine2(dto.getAddressLine2().trim());
        if (dto.getCity() != null) dto.setCity(dto.getCity().trim());
        if (dto.getState() != null) dto.setState(dto.getState().trim());
        if (dto.getPincode() != null) dto.setPincode(dto.getPincode().trim());
        if (dto.getCountry() != null) dto.setCountry(dto.getCountry().trim());
    }

    private void mapToEntity(CompanyDto dto, Company company, Long tenantId) {
        company.setTenantId(tenantId);
        company.setName(dto.getName());
        company.setLegalName(dto.getLegalName());
        company.setTradeName(dto.getTradeName());
        company.setGstin(dto.getGstin());
        company.setPan(dto.getPan());
        company.setStateCode(dto.getStateCode());
        company.setAddressLine1(dto.getAddressLine1());
        company.setAddressLine2(dto.getAddressLine2());
        company.setCity(dto.getCity());
        company.setState(dto.getState());
        company.setPincode(dto.getPincode());
        company.setCountry(dto.getCountry());
        company.setEmail(dto.getEmail());
        company.setPhone(dto.getPhone());
        company.setType(dto.getType());
        company.setActive(dto.getActive() != null ? dto.getActive() : true);
    }

    private CompanyDto toDto(Company company) {
        CompanyDto dto = new CompanyDto();
        dto.setId(company.getId());
        dto.setName(company.getName());
        dto.setLegalName(company.getLegalName());
        dto.setTradeName(company.getTradeName());
        dto.setGstin(company.getGstin());
        dto.setPan(company.getPan());
        dto.setStateCode(company.getStateCode());
        dto.setAddressLine1(company.getAddressLine1());
        dto.setAddressLine2(company.getAddressLine2());
        dto.setCity(company.getCity());
        dto.setState(company.getState());
        dto.setPincode(company.getPincode());
        dto.setCountry(company.getCountry());
        dto.setEmail(company.getEmail());
        dto.setPhone(company.getPhone());
        dto.setType(company.getType());
        dto.setTenantId(company.getTenantId());
        dto.setActive(company.isActive());

        dto.setCreatedAt(company.getCreatedAt());
        dto.setUpdatedAt(company.getUpdatedAt());
        dto.setCreatedBy(company.getCreatedBy());
        dto.setUpdatedBy(company.getUpdatedBy());
        dto.setVersion(company.getVersion());
        return dto;
    }
}