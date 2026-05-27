package com.wilsonks.gstbilling.master.unit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UnitMasterRepository extends JpaRepository<UnitMaster, Long> {
    List<UnitMaster> findByActiveTrueOrderByCodeAsc();
    Optional<UnitMaster> findByCodeIgnoreCase(String code);
}