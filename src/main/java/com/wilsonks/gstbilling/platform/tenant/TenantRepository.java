package com.wilsonks.gstbilling.platform.tenant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TenantRepository extends JpaRepository<Tenant, Long> {
    long countByActiveTrue();

    boolean existsByGstinIgnoreCase(String gstin);

    Optional<Tenant> findByGstinIgnoreCase(String gstin);

    Page<Tenant> findByNameContainingIgnoreCaseOrGstinContainingIgnoreCase(
            String name,
            String gstin,
            Pageable pageable
    );
}