package com.wilsonks.gstbilling.master.gst;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GstSlabMasterService {

    private final GstSlabMasterRepository repository;

    public List<GstSlabMasterDto> getActiveList() {
        return repository.findByActiveTrueOrderByRateAsc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    private GstSlabMasterDto toDto(GstSlabMaster entity) {
        GstSlabMasterDto dto = new GstSlabMasterDto();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setName(entity.getName());
        dto.setRate(entity.getRate());
        dto.setActive(entity.isActive());
        return dto;
    }
}