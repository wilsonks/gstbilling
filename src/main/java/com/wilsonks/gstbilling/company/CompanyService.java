package com.wilsonks.gstbilling.company;

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
public class CompanyService {

    private final CompanyRepository repo;
    private final CompanyValidator validator;

    public CompanyDto create(CompanyDto dto) {
        normalize(dto);
        validator.validateForCreateOrUpdate(dto);

        if (repo.existsByGstinIgnoreCase(dto.getGstin())) {
            throw new CompanyException("Company with the same GSTIN already exists");
        }

        Company c = new Company();
        mapToEntity(dto, c);

        try {
            return toDto(repo.save(c));
        } catch (DataIntegrityViolationException ex) {
            throw new CompanyException("Company with the same GSTIN already exists");
        }
    }

    public CompanyDto update(Long id, CompanyDto dto) {
        Company c = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Company not found: " + id));

        normalize(dto);
        validator.validateForCreateOrUpdate(dto);

        if (!dto.getGstin().equalsIgnoreCase(c.getGstin())
                && repo.existsByGstinIgnoreCase(dto.getGstin())) {
            throw new CompanyException("Company with the same GSTIN already exists");
        }

        mapToEntity(dto, c);

        try {
            return toDto(repo.save(c));
        } catch (DataIntegrityViolationException ex) {
            throw new CompanyException("Company with the same GSTIN already exists");
        }
    }

    public CompanyDto getById(Long id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new NotFoundException("Company not found: " + id));
    }

    public Page<CompanyDto> list(String q, Pageable pageable) {
        if (q == null || q.isBlank()) {
            return repo.findAll(pageable).map(this::toDto);
        }

        String query = q.trim();
        return repo.findByNameContainingIgnoreCaseOrGstinContainingIgnoreCase(query, query, pageable)
                .map(this::toDto);
    }

    public CompanyStats stats() {
        long total = repo.count();
        long active = repo.countByActiveTrue();
        long inactive = total - active;

        List<CompanyDto> recentCompanies = repo.findTop5ByOrderByUpdatedAtDesc()
                .stream()
                .map(this::toDto)
                .toList();

        return new CompanyStats(total, active, inactive, recentCompanies);
    }

    public List<CompanyDto> getAll() {
        return repo.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public CompanyDto deactivate(Long id) {
        Company c = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Company not found: " + id));

        if (c.isActive()) {
            c.setActive(false);
            c = repo.save(c);
        }

        return toDto(c);
    }

    public CompanyDto reactivate(Long id) {
        Company c = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Company not found: " + id));

        if (!c.isActive()) {
            c.setActive(true);
            c = repo.save(c);
        }

        return toDto(c);
    }

    private void normalize(CompanyDto dto) {
        if (dto.getName() != null) {
            dto.setName(dto.getName().trim());
        }
        if (dto.getLegalName() != null) {
            dto.setLegalName(dto.getLegalName().trim());
        }
        if (dto.getTradeName() != null) {
            dto.setTradeName(dto.getTradeName().trim());
        }
        if (dto.getGstin() != null) {
            dto.setGstin(dto.getGstin().trim().toUpperCase(Locale.ROOT));
        }
        if (dto.getEmail() != null) {
            dto.setEmail(dto.getEmail().trim().toLowerCase(Locale.ROOT));
        }
        if (dto.getPhone() != null) {
            dto.setPhone(dto.getPhone().trim());
        }
        if (dto.getAddressLine1() != null) {
            dto.setAddressLine1(dto.getAddressLine1().trim());
        }
        if (dto.getAddressLine2() != null) {
            dto.setAddressLine2(dto.getAddressLine2().trim());
        }
        if (dto.getCity() != null) {
            dto.setCity(dto.getCity().trim());
        }
        if (dto.getState() != null) {
            dto.setState(dto.getState().trim());
        }
        if (dto.getPincode() != null) {
            dto.setPincode(dto.getPincode().trim());
        }
        if (dto.getCountry() != null) {
            dto.setCountry(dto.getCountry().trim());
        }
    }

    private String normalizeGstin(String gstin) {
        if (gstin == null || gstin.isBlank()) {
            throw new CompanyException("GSTIN required");
        }
        return gstin.trim().toUpperCase(Locale.ROOT);
    }

    private void mapToEntity(CompanyDto dto, Company c) {
        c.setName(dto.getName());
        c.setLegalName(dto.getLegalName());
        c.setTradeName(dto.getTradeName());
        c.setGstin(dto.getGstin());
        c.setPan(dto.getPan());
        c.setStateCode(dto.getStateCode());
        c.setAddressLine1(dto.getAddressLine1());
        c.setAddressLine2(dto.getAddressLine2());
        c.setCity(dto.getCity());
        c.setState(dto.getState());
        c.setPincode(dto.getPincode());
        c.setCountry(dto.getCountry());
        c.setEmail(dto.getEmail());
        c.setPhone(dto.getPhone());
        c.setType(dto.getType());
        c.setTenantId(dto.getTenantId());
        c.setActive(dto.getActive() != null ? dto.getActive() : true);
    }

    private CompanyDto toDto(Company c) {
        CompanyDto d = new CompanyDto();
        d.setId(c.getId());
        d.setName(c.getName());
        d.setLegalName(c.getLegalName());
        d.setTradeName(c.getTradeName());
        d.setGstin(c.getGstin());
        d.setPan(c.getPan());
        d.setStateCode(c.getStateCode());
        d.setAddressLine1(c.getAddressLine1());
        d.setAddressLine2(c.getAddressLine2());
        d.setCity(c.getCity());
        d.setState(c.getState());
        d.setPincode(c.getPincode());
        d.setCountry(c.getCountry());
        d.setEmail(c.getEmail());
        d.setPhone(c.getPhone());
        d.setType(c.getType());
        d.setTenantId(c.getTenantId());
        d.setActive(c.isActive());

        d.setCreatedAt(c.getCreatedAt());
        d.setUpdatedAt(c.getUpdatedAt());
        d.setCreatedBy(c.getCreatedBy());
        d.setUpdatedBy(c.getUpdatedBy());
        d.setVersion(c.getVersion());
        return d;
    }

    public boolean existsByGstin(String gstin) {
        String normalized = normalizeGstin(gstin);
        return repo.existsByGstinIgnoreCase(normalized);
    }
}