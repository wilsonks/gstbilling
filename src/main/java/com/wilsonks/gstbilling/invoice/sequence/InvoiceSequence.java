package com.wilsonks.gstbilling.invoice.sequence;

import com.wilsonks.gstbilling.common.TenantScopedEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "t_invoice_sequences",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_invoice_seq_scope",
                        columnNames = {
                                "tenant_id",
                                "company_id",
                                "document_type",
                                "financial_year"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceSequence extends TenantScopedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 30)
    private DocumentType documentType;

    @Column(name = "financial_year", nullable = false, length = 9)
    private String financialYear;

    @Column(name = "prefix", nullable = false, length = 50)
    private String prefix;

    @Column(name = "suffix", length = 20)
    private String suffix;

    @Column(name = "padding_length", nullable = false)
    private Integer paddingLength;

    @Column(name = "current_number", nullable = false)
    private Long currentNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "reset_policy", nullable = false, length = 20)
    private SequenceResetPolicy resetPolicy;

    @Column(nullable = false)
    private boolean active;
}