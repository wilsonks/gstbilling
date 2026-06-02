package com.wilsonks.gstbilling.invoice.sequence;

import com.wilsonks.gstbilling.context.CompanyContext;
import com.wilsonks.gstbilling.context.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class InvoiceSequenceService {

    private final InvoiceSequenceRepository repo;
    private final InvoiceSequenceValidator validator;

    public InvoiceSequenceDto create(InvoiceSequenceDto dto) {
        Long tenantId = getTenantIdOrThrow();
        normalize(dto);
        validator.validateForCreateOrUpdate(dto);

        if (repo.existsByTenantIdAndCompanyIdAndDocumentTypeAndFinancialYear(
                tenantId,
                dto.getCompanyId(),
                dto.getDocumentType(),
                dto.getFinancialYear()
        )) {
            throw new IllegalArgumentException("Invoice sequence already exists for this company, document type, and financial year");
        }

        InvoiceSequence entity = new InvoiceSequence();
        mapToEntity(dto, entity, tenantId);

        try {
            return toDto(repo.save(entity));
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("Invoice sequence already exists for this company, document type, and financial year");
        }
    }

    public InvoiceSequenceDto update(Long id, InvoiceSequenceDto dto) {
        Long tenantId = getTenantIdOrThrow();
        normalize(dto);
        validator.validateForCreateOrUpdate(dto);

        InvoiceSequence entity = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice sequence not found: " + id));

        if (!tenantId.equals(entity.getTenantId())) {
            throw new IllegalArgumentException("You cannot modify an invoice sequence from another tenant");
        }

        boolean uniqueScopeChanged =
                !entity.getCompanyId().equals(dto.getCompanyId())
                        || entity.getDocumentType() != dto.getDocumentType()
                        || !entity.getFinancialYear().equals(dto.getFinancialYear());

        if (uniqueScopeChanged && repo.existsByTenantIdAndCompanyIdAndDocumentTypeAndFinancialYear(
                tenantId,
                dto.getCompanyId(),
                dto.getDocumentType(),
                dto.getFinancialYear()
        )) {
            throw new IllegalArgumentException("Invoice sequence already exists for this company, document type, and financial year");
        }

        mapToEntity(dto, entity, tenantId);

        try {
            return toDto(repo.save(entity));
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("Invoice sequence already exists for this company, document type, and financial year");
        }
    }

    public InvoiceSequenceDto getById(Long id) {
        Long tenantId = getTenantIdOrThrow();

        InvoiceSequence entity = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice sequence not found: " + id));

        if (!tenantId.equals(entity.getTenantId())) {
            throw new IllegalArgumentException("You cannot access an invoice sequence from another tenant");
        }

        return toDto(entity);
    }

    public List<InvoiceSequenceDto> getForCurrentTenant() {
        Long tenantId = getTenantIdOrThrow();
        return repo.findByTenantIdOrderByCompanyIdAscDocumentTypeAscFinancialYearDesc(tenantId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<InvoiceSequenceDto> getForCurrentCompany() {
        Long tenantId = getTenantIdOrThrow();
        Long companyId = getCompanyIdOrThrow();

        return repo.findByTenantIdAndCompanyIdOrderByDocumentTypeAscFinancialYearDesc(tenantId, companyId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public NextSequenceNumberDto nextNumber(DocumentType documentType) {
        Long tenantId = getTenantIdOrThrow();
        Long companyId = getCompanyIdOrThrow();
        return nextNumberInternal(tenantId, companyId, documentType);
    }

    @Transactional
    public NextSequenceNumberDto nextNumberForSeed(Long tenantId, Long companyId, DocumentType documentType) {
        if (tenantId == null) {
            throw new IllegalArgumentException("Tenant id is required");
        }
        if (companyId == null) {
            throw new IllegalArgumentException("Company id is required");
        }
        if (documentType == null) {
            throw new IllegalArgumentException("Document type is required");
        }

        return nextNumberInternal(tenantId, companyId, documentType);
    }

    private NextSequenceNumberDto nextNumberInternal(Long tenantId, Long companyId, DocumentType documentType) {
        String financialYear = FinancialYearUtil.currentFinancialYear();

        InvoiceSequence sequence = repo.findForUpdate(tenantId, companyId, documentType, financialYear)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No active invoice sequence configured for tenant, company, document type, and financial year"
                ));

        if (!sequence.isActive()) {
            throw new IllegalArgumentException("Invoice sequence is inactive");
        }

        long currentNumber = sequence.getCurrentNumber() == null ? 0L : sequence.getCurrentNumber();
        long nextNumber = currentNumber + 1L;
        sequence.setCurrentNumber(nextNumber);
        repo.save(sequence);

        return new NextSequenceNumberDto(
                sequence.getId(),
                nextNumber,
                formatNumber(sequence, nextNumber)
        );
    }

    public InvoiceSequenceDto deactivate(Long id) {
        Long tenantId = getTenantIdOrThrow();

        InvoiceSequence entity = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice sequence not found: " + id));

        if (!tenantId.equals(entity.getTenantId())) {
            throw new IllegalArgumentException("You cannot modify an invoice sequence from another tenant");
        }

        if (entity.isActive()) {
            entity.setActive(false);
            entity = repo.save(entity);
        }

        return toDto(entity);
    }

    public InvoiceSequenceDto reactivate(Long id) {
        Long tenantId = getTenantIdOrThrow();

        InvoiceSequence entity = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice sequence not found: " + id));

        if (!tenantId.equals(entity.getTenantId())) {
            throw new IllegalArgumentException("You cannot modify an invoice sequence from another tenant");
        }

        if (!entity.isActive()) {
            entity.setActive(true);
            entity = repo.save(entity);
        }

        return toDto(entity);
    }

    private Long getTenantIdOrThrow() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant in request context");
        }
        return tenantId;
    }

    private Long getCompanyIdOrThrow() {
        Long companyId = CompanyContext.get();
        if (companyId == null) {
            throw new IllegalStateException("No company in request context");
        }
        return companyId;
    }

    private void normalize(InvoiceSequenceDto dto) {
        if (dto.getFinancialYear() != null) {
            dto.setFinancialYear(dto.getFinancialYear().trim());
        }
        if (dto.getPrefix() != null) {
            dto.setPrefix(dto.getPrefix().trim().toUpperCase(Locale.ROOT));
        }
        if (dto.getSuffix() != null) {
            dto.setSuffix(dto.getSuffix().trim().toUpperCase(Locale.ROOT));
        }
    }

    private void mapToEntity(InvoiceSequenceDto dto, InvoiceSequence entity, Long tenantId) {
        entity.setTenantId(tenantId);
        entity.setCompanyId(dto.getCompanyId());
        entity.setDocumentType(dto.getDocumentType());
        entity.setFinancialYear(dto.getFinancialYear());
        entity.setPrefix(dto.getPrefix());
        entity.setSuffix(dto.getSuffix());
        entity.setPaddingLength(dto.getPaddingLength());
        entity.setCurrentNumber(dto.getCurrentNumber());
        entity.setResetPolicy(dto.getResetPolicy());
        entity.setActive(dto.getActive() == null || dto.getActive());
    }

    private InvoiceSequenceDto toDto(InvoiceSequence entity) {
        InvoiceSequenceDto dto = new InvoiceSequenceDto();
        dto.setId(entity.getId());
        dto.setTenantId(entity.getTenantId());
        dto.setCompanyId(entity.getCompanyId());
        dto.setDocumentType(entity.getDocumentType());
        dto.setFinancialYear(entity.getFinancialYear());
        dto.setPrefix(entity.getPrefix());
        dto.setSuffix(entity.getSuffix());
        dto.setPaddingLength(entity.getPaddingLength());
        dto.setCurrentNumber(entity.getCurrentNumber());
        dto.setResetPolicy(entity.getResetPolicy());
        dto.setActive(entity.isActive());
        dto.setPreview(formatNumber(entity, entity.getCurrentNumber() + 1));

        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setUpdatedBy(entity.getUpdatedBy());
        dto.setVersion(entity.getVersion());

        return dto;
    }

    private String formatNumber(InvoiceSequence sequence, Long number) {
        String prefix = sequence.getPrefix() == null ? "" : sequence.getPrefix();
        String suffix = sequence.getSuffix() == null ? "" : sequence.getSuffix();
        int paddingLength = sequence.getPaddingLength() == null ? 0 : sequence.getPaddingLength();

        String padded = paddingLength > 0
                ? String.format("%0" + paddingLength + "d", number)
                : String.valueOf(number);

        return prefix + padded + suffix;
    }
}