package com.wilsonks.gstbilling.platform.tenant;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateTenantRequest {
    private String name;
    private String gstin;
    private String contactEmail;
    private Boolean active;
}