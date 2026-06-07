package com.wilsonks.gstbilling.auth.identity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameIgnoreCase(String username);

    Optional<User> findByTenantIdAndScopeAndUsernameIgnoreCase(Long tenantId, UserScope scope, String username);

    boolean existsByTenantIdAndScopeAndUsernameIgnoreCase(Long tenantId, UserScope scope, String username);

    boolean existsByUsername(String username);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    long countByScope(UserScope scope);

    Page<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String username, String email, Pageable pageable);


    Optional<User> findByIdAndTenantId(Long id, Long tenantId);

    List<User> findByTenantIdAndScope(Long tenantId, UserScope scope);

    Page<User> findByTenantIdAndScope(Long tenantId, UserScope scope, Pageable pageable);

    Page<User> findByTenantIdAndScopeAndUsernameContainingIgnoreCaseOrTenantIdAndScopeAndEmailContainingIgnoreCase(Long tenantId1, UserScope scope1, String username, Long tenantId2, UserScope scope2, String email, Pageable pageable);

    long countByTenantIdAndScope(Long tenantId, UserScope scope);

    long countByTenantIdAndScopeAndActiveTrue(Long tenantId, UserScope scope);

    List<User> findTop5ByTenantIdAndScopeOrderByUpdatedAtDesc(Long tenantId, UserScope scope);


}