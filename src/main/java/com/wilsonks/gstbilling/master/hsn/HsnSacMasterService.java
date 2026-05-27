package com.wilsonks.gstbilling.master.hsn;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HsnSacMasterService {

    private final HsnSacMasterRepository repository;

    public List<HsnSacMasterDto> getActiveList() {
        return repository.findByActiveTrueOrderByCodeAsc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    private HsnSacMasterDto toDto(HsnSacMaster entity) {
        HsnSacMasterDto dto = new HsnSacMasterDto();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setDescription(entity.getDescription());
        dto.setType(entity.getType());
        dto.setDefaultGstSlabId(entity.getDefaultGstSlab().getId());
        dto.setDefaultGstSlabCode(entity.getDefaultGstSlab().getCode());
        dto.setDefaultGstSlabName(entity.getDefaultGstSlab().getName());
        dto.setDefaultGstRate(entity.getDefaultGstSlab().getRate());
        dto.setActive(entity.isActive());
        return dto;
    }
}