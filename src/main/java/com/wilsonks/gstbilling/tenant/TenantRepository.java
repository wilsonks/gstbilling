package com.wilsonks.gstbilling.tenant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, Long> {
    long countByActiveTrue();

    boolean existsByGstinIgnoreCase(String gstin);


    Page<Tenant> findByNameContainingIgnoreCaseOrGstinContainingIgnoreCase(
            String name,
            String gstin,
            Pageable pageable
    );
}