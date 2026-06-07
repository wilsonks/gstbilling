package com.wilsonks.gstbilling.product.imports;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductImportDto {

    private Long id;

    private String code;

    private String name;

    private String description;

    private BigDecimal defaultPrice;

    private String hsnSacCode;

    private String unitCode;

    private String gstSlabCode;

    private Boolean active;

    private Long hsnSacId;

    private Long unitId;

    private Long gstSlabId;
}