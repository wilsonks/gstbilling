package com.wilsonks.gstbilling.product;

import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class ProductDto {
    private Long id;
    private Long tenantId;

    private String code;
    private String name;
    private String description;

    private BigDecimal defaultPrice;
    private Boolean active;

    private Long hsnSacId;
    private String hsnSacCode;
    private String hsnSacDescription;

    private Long unitId;
    private String unitCode;
    private String unitName;

    private Long gstSlabId;
    private String gstSlabCode;
    private String gstSlabName;
    private BigDecimal gstRate;

    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;
    private Long version;
}