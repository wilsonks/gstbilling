package com.wilsonks.gstbilling.auth.access;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserAccessRepository extends JpaRepository<UserAccess, Long> {
    List<UserAccess> findByUserIdAndActiveTrue(Long userId);
    Optional<UserAccess> findByUserIdAndCompanyId(Long userId, Long companyId);

    boolean existsByUserIdAndCompanyId(Long userId, Long companyId);



    Optional<UserAccess> findByUserIdAndCompanyIdAndActiveTrue(Long userId, Long companyId);


    boolean existsByUserIdAndCompanyIdAndActiveTrue(Long userId, Long companyId);

    long countByActiveTrue();

    long countByActiveFalse();

    Page<UserAccess> findByUserIdOrCompanyIdOrTenantId(
            Long userId,
            Long companyId,
            Long tenantId,
            Pageable pageable
    );


    //Tenant specific queries

    Optional<UserAccess> findByIdAndTenantId(Long id, Long tenantId);

    List<UserAccess> findByTenantId(Long tenantId);

    Page<UserAccess> findByTenantId(Long tenantId, Pageable pageable);

    long countByTenantId(Long tenantId);

    long countByTenantIdAndActiveTrue(Long tenantId);

    List<UserAccess> findTop5ByTenantIdOrderByUpdatedAtDesc(Long tenantId);

    List<UserAccess> findByTenantIdAndActiveTrue(Long tenantId);
}