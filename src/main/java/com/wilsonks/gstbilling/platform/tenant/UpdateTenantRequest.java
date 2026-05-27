package com.wilsonks.gstbilling.platform.tenant;


import lombok.Data;

@Data
public class UpdateTenantRequest {
    private String name;
    private String gstin;
    private String contactEmail;
    private Boolean active;
}