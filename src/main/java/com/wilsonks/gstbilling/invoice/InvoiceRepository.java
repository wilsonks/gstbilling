package com.wilsonks.gstbilling.invoice;

import com.wilsonks.gstbilling.invoice.sequence.DocumentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
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
    Page<Invoice> findByTenantIdAndCompanyIdAndInvoiceNoContainingIgnoreCaseOrTenantIdAndCompanyIdAndCustomerLegalNameContainingIgnoreCase(Long tenantId1, Long companyId1, String invoiceNo, Long tenantId2, Long companyId2, String customerLegalName, Pageable pageable);

    long countByTenantIdAndCompanyId(Long tenantId, Long companyId);

    List<Invoice> findTop5ByTenantIdAndCompanyIdOrderByInvoiceDateDescIdDesc(Long tenantId, Long companyId);

    long countByTenantIdAndCompanyIdAndStatus(Long tenantId, Long companyId, InvoiceStatus status);
    long countByTenantIdAndCompanyIdAndDocumentType(Long tenantId, Long companyId, DocumentType taxInvoice);
    long countByTenantIdAndCompanyIdAndDocumentTypeAndStatus(Long tenantId, Long companyId, DocumentType taxInvoice, InvoiceStatus status);


    @Query("""
            select coalesce(sum(i.totalInvoiceAmount),0)
            from Invoice i
            where i.tenantId = :tenantId
                and i.companyId = :companyId
                and i.documentType = :documentType
            """)
    BigDecimal sumInvoiceValueByDocumentType(Long tenantId, Long companyId, DocumentType documentType);

    @Query("""
            select coalesce(sum(i.totalInvoiceAmount), 0)
            from Invoice i
            where i.tenantId = :tenantId
                and i.companyId = :companyId
                and i.documentType = :documentType
                and year(i.invoiceDate) = year(current_date)
                and month(i.invoiceDate) = month(current_date)
            """)
    BigDecimal sumCurrentMonthInvoiceValueByDocumentType(Long tenantId, Long companyId, DocumentType documentType);

    List<Invoice> findTop10ByTenantIdAndCompanyIdOrderByCreatedAtDesc(
            Long tenantId,
            Long companyId
    );

}