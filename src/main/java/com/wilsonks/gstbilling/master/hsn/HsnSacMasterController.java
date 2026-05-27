package com.wilsonks.gstbilling.master.hsn;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/masters/hsn-sac")
@RequiredArgsConstructor
public class HsnSacMasterController {

    private final HsnSacMasterService service;

    @GetMapping
    public List<HsnSacMasterDto> list() {
        return service.getActiveList();
    }
}