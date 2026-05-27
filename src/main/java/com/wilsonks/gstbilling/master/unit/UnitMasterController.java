package com.wilsonks.gstbilling.master.unit;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/masters/units")
@RequiredArgsConstructor
public class UnitMasterController {

    private final UnitMasterService service;

    @GetMapping
    public List<UnitMasterDto> list() {
        return service.getActiveList();
    }
}