package com.wilsonks.gstbilling.invoice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    @EntityGraph(attributePaths = "lines")
    Optional<Invoice> findByIdAndTenantIdAndCompanyId(Long id, Long tenantId, Long companyId);

    @EntityGraph(attributePaths = "lines")
    Optional<Invoice> findByTenantIdAndCompanyIdAndInvoiceNo(Long tenantId, Long companyId, String invoiceNo);

    @EntityGraph(attributePaths = "lines")
    Page<Invoice> findByTenantIdAndCompanyId(Long tenantId, Long companyId, Pageable pageable);

    @EntityGraph(attributePaths = "lines")
    Page<Invoice> findByTenantIdAndCompanyIdAndInvoiceNoContainingIgnoreCaseOrTenantIdAndCompanyIdAndCustomerLegalNameContainingIgnoreCase(
            Long tenantId1,
            Long companyId1,
            String invoiceNo,
            Long tenantId2,
            Long companyId2,
            String customerLegalName,
            Pageable pageable
    );

    long countByTenantIdAndCompanyId(Long tenantId, Long companyId);

    List<Invoice> findTop5ByTenantIdAndCompanyIdOrderByInvoiceDateDescIdDesc(Long tenantId, Long companyId);
}