package com.wilsonks.gstbilling.company;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByGstinIgnoreCase(String gstin);

    boolean existsByGstinIgnoreCase(String gstin);

    List<Company> findByActiveTrue();

    List<Company> findByTenantId(Long tenantId);

    List<Company> findByTenantIdAndActiveTrue(Long tenantId);

    Optional<Company> findByGstin(String gstin);

    Page<Company> findByNameContainingIgnoreCaseOrGstinContainingIgnoreCase(
            String name,
            String gstin,
            Pageable pageable
    );

    long countByActiveTrue();


    List<Company> findTop5ByOrderByUpdatedAtDesc();


    // For tenant-specific queries
    // Tenant scoped
    Optional<Company> findByIdAndTenantId(Long id, Long tenantId);

    Page<Company> findByTenantId(Long tenantId, Pageable pageable);

    Page<Company> findByTenantIdAndNameContainingIgnoreCaseOrTenantIdAndGstinContainingIgnoreCase(
            Long tenantId1,
            String name,
            Long tenantId2,
            String gstin,
            Pageable pageable
    );

    long countByTenantId(Long tenantId);

    long countByTenantIdAndActiveTrue(Long tenantId);

    List<Company> findTop5ByTenantIdOrderByUpdatedAtDesc(Long tenantId);

    Optional<Company> findByNameIgnoreCase(String companyName);
}