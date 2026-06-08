package com.wilsonks.gstbilling.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByTenantIdAndCodeIgnoreCase(Long tenantId, String code);

    boolean existsByTenantIdAndCodeIgnoreCase(Long tenantId, String code);

    List<Product> findByTenantId(Long tenantId);

    List<Product> findByTenantIdAndActiveTrue(Long tenantId);

    Page<Product> findByTenantId(Long tenantId, Pageable pageable);

    Page<Product> findByTenantIdAndNameContainingIgnoreCaseOrTenantIdAndCodeContainingIgnoreCase(
            Long tenantId1,
            String name,
            Long tenantId2,
            String code,
            Pageable pageable
    );

    long countByTenantId(Long tenantId);

    long countByTenantIdAndActiveTrue(Long tenantId);

    List<Product> findTop5ByTenantIdOrderByUpdatedAtDesc(Long tenantId);

    long countByTenantIdAndActiveFalse(Long tenantId);
}