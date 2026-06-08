package com.wilsonks.gstbilling.invoice.sequence;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface InvoiceSequenceRepository extends JpaRepository<InvoiceSequence, Long> {

    Optional<InvoiceSequence> findByTenantIdAndCompanyIdAndDocumentTypeAndFinancialYear(Long tenantId, Long companyId, DocumentType documentType, String financialYear);

    List<InvoiceSequence> findByTenantIdAndCompanyIdOrderByDocumentTypeAscFinancialYearDesc(Long tenantId, Long companyId);

    List<InvoiceSequence> findByTenantIdOrderByCompanyIdAscDocumentTypeAscFinancialYearDesc(Long tenantId);

    boolean existsByTenantIdAndCompanyIdAndDocumentTypeAndFinancialYear(Long tenantId, Long companyId, DocumentType documentType, String financialYear);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
                select s
                from InvoiceSequence s
                where s.tenantId = :tenantId
                  and s.companyId = :companyId
                  and s.documentType = :documentType
                  and s.financialYear = :financialYear
            """)
    Optional<InvoiceSequence> findForUpdate(Long tenantId, Long companyId, DocumentType documentType, String financialYear);


    long countByTenantIdAndCompanyId(Long tenantId, Long companyId);
}