package com.wilsonks.gstbilling.master.gst;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/masters/gst-slabs")
@RequiredArgsConstructor
public class GstSlabMasterController {

    private final GstSlabMasterService service;

    @GetMapping
    public List<GstSlabMasterDto> list() {
        return service.getActiveList();
    }
}