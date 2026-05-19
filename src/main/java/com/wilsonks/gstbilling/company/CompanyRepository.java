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
}