package com.wilsonks.gstbilling.invoice;

import com.wilsonks.gstbilling.common.TenantScopedEntity;
import com.wilsonks.gstbilling.invoice.sequence.DocumentType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "t_invoices",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_invoices_tenant_company_invoice_no",
                        columnNames = {"tenant_id", "company_id", "invoice_no"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice extends TenantScopedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 30)
    private DocumentType documentType;

    @Column(name = "reference_invoice_id")
    private Long referenceInvoiceId;

    @Column(name = "reference_invoice_no", length = 100)
    private String referenceInvoiceNo;

    @Column(name = "source_proforma_id")
    private Long sourceProformaId;

    @Column(name = "converted_to_invoice_id")
    private Long convertedToInvoiceId;

    @Column(name = "converted_at")
    private Instant convertedAt;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(name = "invoice_no", nullable = false, length = 100)
    private String invoiceNo;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvoiceStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "tax_type", nullable = false, length = 20)
    private TaxType taxType;

    @Column(name = "place_of_supply_state_code", length = 2)
    private String placeOfSupplyStateCode;

    @Column(length = 1000)
    private String notes;

    @Column(name = "terms_and_conditions", length = 2000)
    private String termsAndConditions;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "customer_code", nullable = false, length = 50)
    private String customerCode;

    @Column(name = "customer_legal_name", nullable = false, length = 200)
    private String customerLegalName;

    @Column(name = "customer_trade_name", length = 200)
    private String customerTradeName;

    @Column(name = "customer_gstin", length = 15)
    private String customerGstin;

    @Column(name = "customer_billing_address_line1", length = 200)
    private String customerBillingAddressLine1;

    @Column(name = "customer_billing_address_line2", length = 200)
    private String customerBillingAddressLine2;

    @Column(name = "customer_billing_city", length = 100)
    private String customerBillingCity;

    @Column(name = "customer_billing_state", length = 100)
    private String customerBillingState;

    @Column(name = "customer_billing_state_code", length = 2)
    private String customerBillingStateCode;

    @Column(name = "customer_billing_pincode", length = 12)
    private String customerBillingPincode;

    @Column(name = "customer_billing_country", length = 100)
    private String customerBillingCountry;

    @Column(name = "seller_legal_name", nullable = false, length = 200)
    private String sellerLegalName;

    @Column(name = "seller_gstin", nullable = false, length = 15)
    private String sellerGstin;

    @Column(name = "seller_address_line1", length = 200)
    private String sellerAddressLine1;

    @Column(name = "seller_address_line2", length = 200)
    private String sellerAddressLine2;

    @Column(name = "seller_city", length = 100)
    private String sellerCity;

    @Column(name = "seller_state", length = 100)
    private String sellerState;

    @Column(name = "seller_state_code", length = 2)
    private String sellerStateCode;

    @Column(name = "seller_pincode", length = 12)
    private String sellerPincode;

    @Column(name = "seller_country", length = 100)
    private String sellerCountry;

    @Column(name = "total_taxable_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalTaxableAmount;

    @Column(name = "total_cgst_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalCgstAmount;

    @Column(name = "total_sgst_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalSgstAmount;

    @Column(name = "total_igst_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalIgstAmount;

    @Column(name = "total_tax_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalTaxAmount;

    @Column(name = "total_invoice_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalInvoiceAmount;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("lineNo ASC")
    @Builder.Default
    private List<InvoiceLine> lines = new ArrayList<>();

    public void replaceLines(List<InvoiceLine> newLines) {
        this.lines.clear();
        if (newLines != null) {
            newLines.forEach(this::addLine);
        }
    }

    public void addLine(InvoiceLine line) {
        line.setInvoice(this);
        this.lines.add(line);
    }
}