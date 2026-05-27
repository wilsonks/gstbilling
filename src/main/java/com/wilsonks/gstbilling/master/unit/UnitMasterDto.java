package com.wilsonks.gstbilling.master.unit;

import lombok.Data;

@Data
public class UnitMasterDto {
    private Long id;
    private String code;
    private String name;
    private String symbol;
    private Boolean active;
}