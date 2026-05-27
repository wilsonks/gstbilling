package com.wilsonks.gstbilling.master.gst;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GstSlabMasterRepository extends JpaRepository<GstSlabMaster, Long> {
    List<GstSlabMaster> findByActiveTrueOrderByRateAsc();
    Optional<GstSlabMaster> findByCodeIgnoreCase(String code);
}