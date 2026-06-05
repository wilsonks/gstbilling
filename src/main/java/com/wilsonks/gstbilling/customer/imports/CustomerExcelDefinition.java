package com.wilsonks.gstbilling.customer.imports;


import com.wilsonks.gstbilling.bulk.excel.ExcelColumn;
import com.wilsonks.gstbilling.customer.CustomerDto;
import com.wilsonks.gstbilling.customer.CustomerType;
import com.wilsonks.gstbilling.customer.GstRegistrationType;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CustomerExcelDefinition {

    public List<ExcelColumn> columns() {

        return List.of(

                ExcelColumn.builder()
                        .header("ID")
                        .fieldName("id")
                        .dataType(Long.class)
                        .hidden(true)
                        .description("Internal identifier used for updates")
                        .example("1001")
                        .width(3000)
                        .build(),

                ExcelColumn.builder()
                        .header("CODE")
                        .fieldName("code")
                        .required(true)
                        .dataType(String.class)
                        .description("Unique customer code")
                        .example("CUST001")
                        .width(5000)
                        .build(),

                ExcelColumn.builder()
                        .header("LEGAL_NAME")
                        .fieldName("legalName")
                        .required(true)
                        .dataType(String.class)
                        .description("Registered legal name")
                        .example("ABC Traders Pvt Ltd")
                        .width(10000)
                        .build(),

                ExcelColumn.builder()
                        .header("TRADE_NAME")
                        .fieldName("tradeName")
                        .dataType(String.class)
                        .description("Trade name")
                        .example("ABC Traders")
                        .width(10000)
                        .build(),

                ExcelColumn.builder()
                        .header("CUSTOMER_TYPE")
                        .fieldName("customerType")
                        .dataType(CustomerType.class)
                        .description("Customer type")
                        .example("BUSINESS")
                        .width(5000)
                        .build(),

                ExcelColumn.builder()
                        .header("GST_REGISTRATION_TYPE")
                        .fieldName("gstRegistrationType")
                        .dataType(GstRegistrationType.class)
                        .description("GST registration type")
                        .example("REGISTERED")
                        .width(6000)
                        .build(),

                ExcelColumn.builder()
                        .header("GSTIN")
                        .fieldName("gstin")
                        .dataType(String.class)
                        .description("GST Identification Number")
                        .example("29ABCDE1234F1Z5")
                        .width(6000)
                        .build(),

                ExcelColumn.builder()
                        .header("PAN")
                        .fieldName("pan")
                        .dataType(String.class)
                        .description("PAN Number")
                        .example("ABCDE1234F")
                        .width(5000)
                        .build(),

                ExcelColumn.builder()
                        .header("CONTACT_PERSON")
                        .fieldName("contactPerson")
                        .dataType(String.class)
                        .description("Primary contact")
                        .example("John Doe")
                        .width(8000)
                        .build(),

                ExcelColumn.builder()
                        .header("PHONE")
                        .fieldName("phone")
                        .dataType(String.class)
                        .description("Phone number")
                        .example("9876543210")
                        .width(5000)
                        .build(),

                ExcelColumn.builder()
                        .header("EMAIL")
                        .fieldName("email")
                        .dataType(String.class)
                        .description("Email address")
                        .example("abc@test.com")
                        .width(9000)
                        .build(),

                ExcelColumn.builder()
                        .header("BILLING_ADDRESS_LINE1")
                        .fieldName("billingAddressLine1")
                        .dataType(String.class)
                        .width(12000)
                        .build(),

                ExcelColumn.builder()
                        .header("BILLING_ADDRESS_LINE2")
                        .fieldName("billingAddressLine2")
                        .dataType(String.class)
                        .width(12000)
                        .build(),

                ExcelColumn.builder()
                        .header("BILLING_CITY")
                        .fieldName("billingCity")
                        .dataType(String.class)
                        .width(5000)
                        .build(),

                ExcelColumn.builder()
                        .header("BILLING_STATE")
                        .fieldName("billingState")
                        .dataType(String.class)
                        .width(5000)
                        .build(),

                ExcelColumn.builder()
                        .header("BILLING_STATE_CODE")
                        .fieldName("billingStateCode")
                        .dataType(String.class)
                        .width(3000)
                        .build(),

                ExcelColumn.builder()
                        .header("BILLING_PINCODE")
                        .fieldName("billingPincode")
                        .dataType(String.class)
                        .width(4000)
                        .build(),

                ExcelColumn.builder()
                        .header("BILLING_COUNTRY")
                        .fieldName("billingCountry")
                        .dataType(String.class)
                        .example("India")
                        .width(5000)
                        .build(),

                ExcelColumn.builder()
                        .header("SHIPPING_SAME_AS_BILLING")
                        .fieldName("shippingSameAsBilling")
                        .dataType(Boolean.class)
                        .example("TRUE")
                        .width(5000)
                        .build(),

                ExcelColumn.builder()
                        .header("SHIPPING_ADDRESS_LINE1")
                        .fieldName("shippingAddressLine1")
                        .dataType(String.class)
                        .width(12000)
                        .build(),

                ExcelColumn.builder()
                        .header("SHIPPING_ADDRESS_LINE2")
                        .fieldName("shippingAddressLine2")
                        .dataType(String.class)
                        .width(12000)
                        .build(),

                ExcelColumn.builder()
                        .header("SHIPPING_CITY")
                        .fieldName("shippingCity")
                        .dataType(String.class)
                        .width(5000)
                        .build(),

                ExcelColumn.builder()
                        .header("SHIPPING_STATE")
                        .fieldName("shippingState")
                        .dataType(String.class)
                        .width(5000)
                        .build(),

                ExcelColumn.builder()
                        .header("SHIPPING_STATE_CODE")
                        .fieldName("shippingStateCode")
                        .dataType(String.class)
                        .width(3000)
                        .build(),

                ExcelColumn.builder()
                        .header("SHIPPING_PINCODE")
                        .fieldName("shippingPincode")
                        .dataType(String.class)
                        .width(4000)
                        .build(),

                ExcelColumn.builder()
                        .header("SHIPPING_COUNTRY")
                        .fieldName("shippingCountry")
                        .dataType(String.class)
                        .example("India")
                        .width(5000)
                        .build(),

                ExcelColumn.builder()
                        .header("PAYMENT_TERMS_DAYS")
                        .fieldName("paymentTermsDays")
                        .dataType(Integer.class)
                        .example("30")
                        .width(4000)
                        .build(),

                ExcelColumn.builder()
                        .header("ACTIVE")
                        .fieldName("active")
                        .dataType(Boolean.class)
                        .example("TRUE")
                        .width(3000)
                        .build()
        );
    }
}