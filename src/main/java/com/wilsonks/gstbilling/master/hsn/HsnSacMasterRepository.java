package com.wilsonks.gstbilling.master.hsn;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HsnSacMasterRepository extends JpaRepository<HsnSacMaster, Long> {
    List<HsnSacMaster> findByActiveTrueOrderByCodeAsc();
    Optional<HsnSacMaster> findByCodeIgnoreCase(String code);
}