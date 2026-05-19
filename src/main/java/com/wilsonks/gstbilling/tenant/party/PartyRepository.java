package com.wilsonks.gstbilling.tenant.party;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PartyRepository extends JpaRepository<Party, Long> {

    Optional<Party> findByGstinIgnoreCase(String gstin);

    Page<Party> findByIsActive(boolean isActive, Pageable pageable);

    Page<Party> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Party> findByNameContainingIgnoreCaseAndIsActive(String name, boolean isActive, Pageable pageable);

}
