package com.wilsonks.gstbilling.master.unit;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UnitMasterService {

    private final UnitMasterRepository repository;

    public List<UnitMasterDto> getActiveList() {
        return repository.findByActiveTrueOrderByCodeAsc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    private UnitMasterDto toDto(UnitMaster entity) {
        UnitMasterDto dto = new UnitMasterDto();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setName(entity.getName());
        dto.setSymbol(entity.getSymbol());
        dto.setActive(entity.isActive());
        return dto;
    }
}