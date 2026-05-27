package com.wilsonks.gstbilling.platform.tenant;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantDto {
    private Long tenantId;
    private String name;
    private String gstin;
    private String contactEmail;
    private Boolean active;

}