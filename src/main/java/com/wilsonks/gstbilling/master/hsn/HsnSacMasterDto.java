package com.wilsonks.gstbilling.master.hsn;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class HsnSacMasterDto {
    private Long id;
    private String code;
    private String description;
    private HsnSacType type;
    private Long defaultGstSlabId;
    private String defaultGstSlabCode;
    private String defaultGstSlabName;
    private BigDecimal defaultGstRate;
    private Boolean active;
}