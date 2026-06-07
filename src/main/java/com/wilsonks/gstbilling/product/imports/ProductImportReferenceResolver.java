package com.wilsonks.gstbilling.product.imports;

import com.wilsonks.gstbilling.master.gst.GstSlabMaster;
import com.wilsonks.gstbilling.master.gst.GstSlabMasterRepository;
import com.wilsonks.gstbilling.master.hsn.HsnSacMaster;
import com.wilsonks.gstbilling.master.hsn.HsnSacMasterRepository;
import com.wilsonks.gstbilling.master.unit.UnitMaster;
import com.wilsonks.gstbilling.master.unit.UnitMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductImportReferenceResolver {

    private final HsnSacMasterRepository hsnSacRepository;

    private final UnitMasterRepository unitRepository;

    private final GstSlabMasterRepository gstSlabRepository;

    public HsnSacMaster resolveHsnSac(String code) {

        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException(
                    "HSN/SAC Code is required");
        }

        return hsnSacRepository
                .findByCodeIgnoreCase(code.trim())
                .filter(HsnSacMaster::isActive)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid active HSN/SAC Code: " + code));
    }

    public UnitMaster resolveUnit(String code) {

        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException(
                    "Unit Code is required");
        }

        return unitRepository
                .findByCodeIgnoreCase(code.trim())
                .filter(UnitMaster::isActive)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid active Unit Code: " + code));
    }

    public GstSlabMaster resolveGstSlab(String code) {

        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException(
                    "GST Slab Code is required");
        }

        return gstSlabRepository
                .findByCodeIgnoreCase(code.trim())
                .filter(GstSlabMaster::isActive)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid active GST Slab Code: " + code));
    }

    public void populateReferenceIds(ProductImportDto dto) {

        HsnSacMaster hsnSac =
                resolveHsnSac(dto.getHsnSacCode());

        UnitMaster unit =
                resolveUnit(dto.getUnitCode());

        GstSlabMaster gstSlab =
                resolveGstSlab(dto.getGstSlabCode());

        dto.setHsnSacId(
                hsnSac.getId());

        dto.setUnitId(
                unit.getId());

        dto.setGstSlabId(
                gstSlab.getId());
    }
}