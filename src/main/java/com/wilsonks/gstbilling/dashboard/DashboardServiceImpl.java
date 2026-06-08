package com.wilsonks.gstbilling.dashboard;

import com.wilsonks.gstbilling.company.CompanyRepository;
import com.wilsonks.gstbilling.context.CompanyContext;
import com.wilsonks.gstbilling.context.TenantContext;
import com.wilsonks.gstbilling.customer.CustomerRepository;
import com.wilsonks.gstbilling.dashboard.dto.DashboardAlertsResponse;
import com.wilsonks.gstbilling.dashboard.dto.DashboardRecentDocumentDto;
import com.wilsonks.gstbilling.dashboard.dto.DashboardSummaryResponse;
import com.wilsonks.gstbilling.invoice.InvoiceRepository;
import com.wilsonks.gstbilling.invoice.InvoiceStatus;
import com.wilsonks.gstbilling.invoice.sequence.DocumentType;
import com.wilsonks.gstbilling.invoice.sequence.InvoiceSequenceRepository;
import com.wilsonks.gstbilling.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final CompanyRepository companyRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceSequenceRepository invoiceSequenceRepository;


    @Override
    public DashboardSummaryResponse getDashboardSummary() {
        Long tenantId = TenantContext.get();
        Long companyId = CompanyContext.get();


        long companyCount = companyRepository.countByTenantId(tenantId);
        long activeCompanyCount = companyRepository.countByTenantIdAndActiveTrue(tenantId);

        long customerCount = customerRepository.countByTenantId(tenantId);
        long activeCustomerCount = customerRepository.countByTenantIdAndActiveTrue(tenantId);

        long productCount = productRepository.countByTenantId(tenantId);
        long activeProductCount = productRepository.countByTenantIdAndActiveTrue(tenantId);

        long invoiceSequenceCount = invoiceSequenceRepository.countByTenantIdAndCompanyId(tenantId, companyId);

        long taxInvoiceCount = invoiceRepository.countByTenantIdAndCompanyIdAndDocumentType(tenantId, companyId, DocumentType.TAX_INVOICE);

        long proformaInvoiceCount = invoiceRepository.countByTenantIdAndCompanyIdAndDocumentType(tenantId, companyId, DocumentType.PROFORMA_INVOICE);

        long creditNoteCount = invoiceRepository.countByTenantIdAndCompanyIdAndDocumentType(tenantId, companyId, DocumentType.CREDIT_NOTE);

        long debitNoteCount = invoiceRepository.countByTenantIdAndCompanyIdAndDocumentType(tenantId, companyId, DocumentType.DEBIT_NOTE);


        BigDecimal taxInvoiceValue = invoiceRepository.sumInvoiceValueByDocumentType(tenantId, companyId, DocumentType.TAX_INVOICE);

        BigDecimal proformaInvoiceValue = invoiceRepository.sumInvoiceValueByDocumentType(tenantId, companyId, DocumentType.PROFORMA_INVOICE);
        BigDecimal creditNoteValue = invoiceRepository.sumInvoiceValueByDocumentType(tenantId, companyId, DocumentType.CREDIT_NOTE);
        BigDecimal debitNoteValue = invoiceRepository.sumInvoiceValueByDocumentType(tenantId, companyId, DocumentType.DEBIT_NOTE);

        BigDecimal netRevenue = taxInvoiceValue.subtract(creditNoteValue).add(debitNoteValue);


        BigDecimal taxInvoiceValueThisMonth = invoiceRepository.sumCurrentMonthInvoiceValueByDocumentType(tenantId, companyId, DocumentType.TAX_INVOICE);

        BigDecimal creditNoteValueThisMonth = invoiceRepository.sumCurrentMonthInvoiceValueByDocumentType(tenantId, companyId, DocumentType.CREDIT_NOTE);
        BigDecimal debitNoteValueThisMonth = invoiceRepository.sumCurrentMonthInvoiceValueByDocumentType(tenantId, companyId, DocumentType.DEBIT_NOTE);

        BigDecimal monthlyRevenue = taxInvoiceValueThisMonth.subtract(creditNoteValueThisMonth).add(debitNoteValueThisMonth);

        long convertedProformaCount = invoiceRepository.countByTenantIdAndCompanyIdAndDocumentTypeAndStatus(tenantId, companyId, DocumentType.PROFORMA_INVOICE, InvoiceStatus.CONVERTED);
        BigDecimal proformaConversionRate = proformaInvoiceCount > 0 ? BigDecimal.valueOf(convertedProformaCount).divide(BigDecimal.valueOf(proformaInvoiceCount), 2, BigDecimal.ROUND_HALF_UP).multiply(BigDecimal.valueOf(100)) : BigDecimal.ZERO;

        BigDecimal averageInvoiceValue = taxInvoiceCount > 0 ? taxInvoiceValue.divide(BigDecimal.valueOf(taxInvoiceCount), 2, BigDecimal.ROUND_HALF_UP) : BigDecimal.ZERO;

        return DashboardSummaryResponse.builder().companyCount(companyCount).activeCompanyCount(activeCompanyCount)

                .customerCount(customerCount).activeCustomerCount(activeCustomerCount)

                .productCount(productCount).activeProductCount(activeProductCount)

                .invoiceSequenceCount(invoiceSequenceCount)

                .taxInvoiceCount(taxInvoiceCount).proformaInvoiceCount(proformaInvoiceCount).creditNoteCount(creditNoteCount).debitNoteCount(debitNoteCount)

                .taxInvoiceValue(taxInvoiceValue).proformaInvoiceValue(proformaInvoiceValue).creditNoteValue(creditNoteValue).debitNoteValue(debitNoteValue)

                .netRevenue(netRevenue).monthlyRevenue(monthlyRevenue)

                .averageInvoiceValue(averageInvoiceValue)

                .build();
    }

    @Override
    public DashboardAlertsResponse getAlerts() {

        Long tenantId = TenantContext.get();
        Long companyId = CompanyContext.get();

        long pendingProformaCount = invoiceRepository.countByTenantIdAndCompanyIdAndDocumentTypeAndStatus(tenantId, companyId, DocumentType.PROFORMA_INVOICE, InvoiceStatus.ISSUED);

        long convertedProformaCount = invoiceRepository.countByTenantIdAndCompanyIdAndDocumentTypeAndStatus(tenantId, companyId, DocumentType.PROFORMA_INVOICE, InvoiceStatus.CONVERTED);

        BigDecimal proformaConversionRate = pendingProformaCount + convertedProformaCount > 0 ? BigDecimal.valueOf(convertedProformaCount).divide(BigDecimal.valueOf(pendingProformaCount + convertedProformaCount), 2, BigDecimal.ROUND_HALF_UP).multiply(BigDecimal.valueOf(100)) : BigDecimal.ZERO;

        long draftDocumentCount = invoiceRepository.countByTenantIdAndCompanyIdAndStatus(tenantId, companyId, InvoiceStatus.DRAFT);

        long cancelledDocumentCount = invoiceRepository.countByTenantIdAndCompanyIdAndStatus(tenantId, companyId, InvoiceStatus.CANCELLED);

        long inactiveCustomerCount = customerRepository.countByTenantIdAndActiveFalse(tenantId);

        long inactiveProductCount = productRepository.countByTenantIdAndActiveFalse(tenantId);

        return DashboardAlertsResponse.builder()
                .pendingProformaCount(pendingProformaCount)
                .convertedProformaCount(convertedProformaCount)
                .proformaConversionRate(proformaConversionRate)
                .draftDocumentCount(draftDocumentCount)
                .cancelledDocumentCount(cancelledDocumentCount)
                .inactiveCustomerCount(inactiveCustomerCount)
                .inactiveProductCount(inactiveProductCount)
                .build();
    }


    @Override
    public List<DashboardRecentDocumentDto>
    getRecentDocuments() {

        Long tenantId =
                TenantContext.get();

        Long companyId =
                CompanyContext.get();

        return invoiceRepository
                .findTop10ByTenantIdAndCompanyIdOrderByCreatedAtDesc(
                        tenantId,
                        companyId
                )
                .stream()
                .map(invoice ->
                        new DashboardRecentDocumentDto(
                                invoice.getId(),
                                invoice.getInvoiceNo(),
                                invoice.getDocumentType(),
                                invoice.getStatus(),
                                invoice.getCustomerLegalName(),
                                invoice.getInvoiceDate(),
                                invoice.getTotalInvoiceAmount()
                        )
                )
                .toList();
    }
}
