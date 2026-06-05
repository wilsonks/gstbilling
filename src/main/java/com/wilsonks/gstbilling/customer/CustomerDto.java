package com.wilsonks.gstbilling.customer;

import com.wilsonks.gstbilling.bulk.excel.ExcelRowAware;
import lombok.Data;

import java.time.Instant;

@Data
public class CustomerDto implements ExcelRowAware {
    private Long id;
    private Long tenantId;

    private String code;
    private String legalName;
    private String tradeName;

    private CustomerType customerType;
    private GstRegistrationType gstRegistrationType;

    private String gstin;
    private String pan;

    private String contactPerson;
    private String phone;
    private String email;

    private String billingAddressLine1;
    private String billingAddressLine2;
    private String billingCity;
    private String billingState;
    private String billingStateCode;
    private String billingPincode;
    private String billingCountry;

    private Boolean shippingSameAsBilling;
    private String shippingAddressLine1;
    private String shippingAddressLine2;
    private String shippingCity;
    private String shippingState;
    private String shippingStateCode;
    private String shippingPincode;
    private String shippingCountry;

    private Integer paymentTermsDays;
    private Boolean active;
    private int excelRowNumber;

    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;
    private Long version;


}