package com.wilsonks.gstbilling.master.gst;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class GstSlabMasterDto {
    private Long id;
    private String code;
    private String name;
    private BigDecimal rate;
    private Boolean active;
}