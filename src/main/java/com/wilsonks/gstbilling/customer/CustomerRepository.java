package com.wilsonks.gstbilling.customer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByTenantIdAndCodeIgnoreCase(Long tenantId, String code);

    boolean existsByTenantIdAndCodeIgnoreCase(Long tenantId, String code);

    boolean existsByTenantIdAndGstinIgnoreCase(Long tenantId, String gstin);

    List<Customer> findByTenantId(Long tenantId);

    List<Customer> findByTenantIdAndActiveTrue(Long tenantId);

    Page<Customer> findByTenantId(Long tenantId, Pageable pageable);

    Page<Customer> findByTenantIdAndLegalNameContainingIgnoreCaseOrTenantIdAndCodeContainingIgnoreCase(
            Long tenantId1,
            String legalName,
            Long tenantId2,
            String code,
            Pageable pageable
    );

    long countByTenantId(Long tenantId);

    long countByTenantIdAndActiveTrue(Long tenantId);

    List<Customer> findTop5ByTenantIdOrderByUpdatedAtDesc(Long tenantId);


    // For imports validation
    Optional<Customer> findByIdAndTenantId(
            Long id,
            Long tenantId);

    Optional<Customer> findByTenantIdAndGstinIgnoreCase(
            Long tenantId,
            String gstin);

    long countByTenantIdAndActiveFalse(Long tenantId);


}