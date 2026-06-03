package com.wilsonks.gstbilling.bulk.excel;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ExcelColumn {

    private String header;

    private String fieldName;

    private Class<?> dataType;

    private boolean required;

    private boolean hidden;

    private String description;

    private String example;

    private Integer width;
}