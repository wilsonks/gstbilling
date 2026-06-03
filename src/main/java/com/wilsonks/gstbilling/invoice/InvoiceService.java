package com.wilsonks.gstbilling.invoice;

import com.wilsonks.gstbilling.company.Company;
import com.wilsonks.gstbilling.company.CompanyRepository;
import com.wilsonks.gstbilling.context.CompanyContext;
import com.wilsonks.gstbilling.context.TenantContext;
import com.wilsonks.gstbilling.customer.Customer;
import com.wilsonks.gstbilling.customer.CustomerRepository;
import com.wilsonks.gstbilling.invoice.sequence.DocumentType;
import com.wilsonks.gstbilling.invoice.sequence.InvoiceSequenceService;
import com.wilsonks.gstbilling.invoice.sequence.NextSequenceNumberDto;
import com.wilsonks.gstbilling.master.gst.GstSlabMaster;
import com.wilsonks.gstbilling.master.gst.GstSlabMasterRepository;
import com.wilsonks.gstbilling.master.hsn.HsnSacMaster;
import com.wilsonks.gstbilling.master.hsn.HsnSacMasterRepository;
import com.wilsonks.gstbilling.master.unit.UnitMaster;
import com.wilsonks.gstbilling.master.unit.UnitMasterRepository;
import com.wilsonks.gstbilling.product.Product;
import com.wilsonks.gstbilling.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository repo;
    private final InvoiceValidator validator;
    private final CustomerRepository customerRepository;
    private final CompanyRepository companyRepository;
    private final ProductRepository productRepository;
    private final HsnSacMasterRepository hsnSacRepository;
    private final UnitMasterRepository unitRepository;
    private final GstSlabMasterRepository gstSlabRepository;
    private final InvoiceSequenceService invoiceSequenceService;

    @Transactional
    public InvoiceDto create(CreateInvoiceRequest request) {
        Long tenantId = getTenantIdOrThrow();
        Long companyId = getCompanyIdOrThrow();
        return createInternal(tenantId, companyId, request, false);
    }

    @Transactional
    public InvoiceDto createForSeed(Long tenantId, Long companyId, CreateInvoiceRequest request) {
        if (tenantId == null) {
            throw new IllegalArgumentException("Tenant id is required");
        }
        if (companyId == null) {
            throw new IllegalArgumentException("Company id is required");
        }
        return createInternal(tenantId, companyId, request, true);
    }

    @Transactional
    public InvoiceDto convertToTaxInvoice(Long id) {
        Long tenantId = getTenantIdOrThrow();
        Long companyId = getCompanyIdOrThrow();

        Invoice proforma = repo.findByIdAndTenantIdAndCompanyId(id, tenantId, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + id));

        validateProformaConvertible(proforma);

        CreateInvoiceRequest request = new CreateInvoiceRequest();
        request.setCustomerId(proforma.getCustomerId());
        request.setDocumentType(DocumentType.TAX_INVOICE);
        request.setReferenceInvoiceId(null);
        request.setSourceProformaId(proforma.getId());
        request.setInvoiceDate(LocalDate.now());
        request.setValidUntil(null);
        request.setNotes(proforma.getNotes());
        request.setTermsAndConditions(proforma.getTermsAndConditions());

        List<CreateInvoiceLineRequest> lineRequests = new ArrayList<>();
        for (InvoiceLine line : proforma.getLines()) {
            CreateInvoiceLineRequest lineRequest = new CreateInvoiceLineRequest();
            lineRequest.setProductId(line.getProductId());
            lineRequest.setDescription(line.getDescription());
            lineRequest.setQuantity(line.getQuantity());
            lineRequest.setUnitPrice(line.getUnitPrice());
            lineRequests.add(lineRequest);
        }
        request.setLines(lineRequests);

        InvoiceDto converted = createInternal(tenantId, companyId, request, false);

        proforma.setStatus(InvoiceStatus.CONVERTED);
        proforma.setConvertedToInvoiceId(converted.getId());
        proforma.setConvertedAt(Instant.now());
        repo.save(proforma);

        return converted;
    }

    private InvoiceDto createInternal(Long tenantId, Long companyId, CreateInvoiceRequest request, boolean seedMode) {
        validator.validateForCreate(request);

        DocumentType documentType = resolveDocumentType(request);

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + request.getCustomerId()));

        if (!tenantId.equals(customer.getTenantId())) {
            throw new IllegalArgumentException("Customer does not belong to current tenant");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));

        if (!tenantId.equals(company.getTenantId())) {
            throw new IllegalArgumentException("Company does not belong to current tenant");
        }

        Invoice referenceInvoice = resolveAndValidateReferenceInvoice(
                tenantId,
                companyId,
                customer.getId(),
                documentType,
                request.getReferenceInvoiceId()
        );

        Invoice sourceProforma = resolveAndValidateSourceProforma(
                tenantId,
                companyId,
                customer.getId(),
                documentType,
                request.getSourceProformaId()
        );

        TaxType taxType = referenceInvoice != null
                ? referenceInvoice.getTaxType()
                : sourceProforma != null
                ? sourceProforma.getTaxType()
                : resolveTaxType(company.getStateCode(), customer.getBillingStateCode(), customer.getGstin());

        NextSequenceNumberDto nextSequence = seedMode
                ? invoiceSequenceService.nextNumberForSeed(tenantId, companyId, documentType)
                : invoiceSequenceService.nextNumber(documentType);

        Invoice invoice = new Invoice();
        invoice.setTenantId(tenantId);
        invoice.setCompanyId(companyId);
        invoice.setDocumentType(documentType);
        invoice.setReferenceInvoiceId(referenceInvoice != null ? referenceInvoice.getId() : null);
        invoice.setReferenceInvoiceNo(referenceInvoice != null ? referenceInvoice.getInvoiceNo() : null);
        invoice.setSourceProformaId(sourceProforma != null ? sourceProforma.getId() : null);
        invoice.setConvertedToInvoiceId(null);
        invoice.setConvertedAt(null);
        invoice.setValidUntil(documentType == DocumentType.PROFORMA_INVOICE ? request.getValidUntil() : null);
        invoice.setInvoiceNo(nextSequence.getFormattedNumber());
        invoice.setInvoiceDate(request.getInvoiceDate());
        invoice.setDueDate(resolveDueDate(request.getInvoiceDate(), customer.getPaymentTermsDays()));
        invoice.setStatus(InvoiceStatus.ISSUED);
        invoice.setTaxType(taxType);
        invoice.setPlaceOfSupplyStateCode(customer.getBillingStateCode());
        invoice.setNotes(request.getNotes());
        invoice.setTermsAndConditions(request.getTermsAndConditions());

        snapshotCustomer(invoice, customer);
        snapshotSeller(invoice, company);

        List<InvoiceLine> lines = new ArrayList<>();
        int lineNo = 1;

        BigDecimal totalTaxable = money(0);
        BigDecimal totalCgst = money(0);
        BigDecimal totalSgst = money(0);
        BigDecimal totalIgst = money(0);

        for (CreateInvoiceLineRequest reqLine : request.getLines()) {
            Product product = productRepository.findById(reqLine.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + reqLine.getProductId()));

            if (!tenantId.equals(product.getTenantId())) {
                throw new IllegalArgumentException("Product does not belong to current tenant");
            }

            HsnSacMaster hsnSac = hsnSacRepository.findById(product.getHsnSacId())
                    .orElseThrow(() -> new IllegalStateException("HSN/SAC master missing for product " + product.getId()));

            UnitMaster unit = unitRepository.findById(product.getUnitId())
                    .orElseThrow(() -> new IllegalStateException("Unit master missing for product " + product.getId()));

            GstSlabMaster gstSlab = gstSlabRepository.findById(product.getGstSlabId())
                    .orElseThrow(() -> new IllegalStateException("GST slab master missing for product " + product.getId()));

            InvoiceLine line = buildInvoiceLine(
                    invoice,
                    product,
                    hsnSac,
                    unit,
                    gstSlab,
                    reqLine,
                    taxType,
                    lineNo++
            );

            lines.add(line);

            totalTaxable = totalTaxable.add(line.getTaxableAmount());
            totalCgst = totalCgst.add(line.getCgstAmount());
            totalSgst = totalSgst.add(line.getSgstAmount());
            totalIgst = totalIgst.add(line.getIgstAmount());
        }

        invoice.replaceLines(lines);

        BigDecimal totalTax = totalCgst.add(totalSgst).add(totalIgst);
        BigDecimal totalInvoiceAmount = totalTaxable.add(totalTax);

        invoice.setTotalTaxableAmount(totalTaxable);
        invoice.setTotalCgstAmount(totalCgst);
        invoice.setTotalSgstAmount(totalSgst);
        invoice.setTotalIgstAmount(totalIgst);
        invoice.setTotalTaxAmount(totalTax);
        invoice.setTotalInvoiceAmount(totalInvoiceAmount);

        return toDto(repo.save(invoice));
    }

    public InvoiceDto getById(Long id) {
        Long tenantId = getTenantIdOrThrow();
        Long companyId = getCompanyIdOrThrow();

        Invoice invoice = repo.findByIdAndTenantIdAndCompanyId(id, tenantId, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + id));

        return toDto(invoice);
    }

    public Page<InvoiceDto> list(String q, Pageable pageable) {
        Long tenantId = getTenantIdOrThrow();
        Long companyId = getCompanyIdOrThrow();

        if (q == null || q.isBlank()) {
            return repo.findByTenantIdAndCompanyId(tenantId, companyId, pageable)
                    .map(this::toDto);
        }

        String query = q.trim();
        return repo.findByTenantIdAndCompanyIdAndInvoiceNoContainingIgnoreCaseOrTenantIdAndCompanyIdAndCustomerLegalNameContainingIgnoreCase(
                        tenantId, companyId, query,
                        tenantId, companyId, query,
                        pageable
                )
                .map(this::toDto);
    }

    public InvoiceStats stats() {
        Long tenantId = getTenantIdOrThrow();
        Long companyId = getCompanyIdOrThrow();

        long total = repo.countByTenantIdAndCompanyId(tenantId, companyId);

        List<InvoiceDto> recentInvoices = repo.findTop5ByTenantIdAndCompanyIdOrderByInvoiceDateDescIdDesc(tenantId, companyId)
                .stream()
                .map(this::toDto)
                .toList();

        return new InvoiceStats(total, recentInvoices);
    }

    @Transactional
    public InvoiceDto cancel(Long id) {
        Long tenantId = getTenantIdOrThrow();
        Long companyId = getCompanyIdOrThrow();

        Invoice invoice = repo.findByIdAndTenantIdAndCompanyId(id, tenantId, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + id));

        if (invoice.getDocumentType() == DocumentType.PROFORMA_INVOICE
                && invoice.getConvertedToInvoiceId() != null) {
            throw new IllegalArgumentException("Converted proforma invoice cannot be cancelled");
        }

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            return toDto(invoice);
        }

        invoice.setStatus(InvoiceStatus.CANCELLED);
        return toDto(repo.save(invoice));
    }

    private DocumentType resolveDocumentType(CreateInvoiceRequest request) {
        DocumentType documentType = request.getDocumentType();
        if (documentType == null) {
            return DocumentType.TAX_INVOICE;
        }

        return documentType;
    }

    private Invoice resolveAndValidateReferenceInvoice(
            Long tenantId,
            Long companyId,
            Long customerId,
            DocumentType documentType,
            Long referenceInvoiceId
    ) {
        boolean requiresReference =
                documentType == DocumentType.CREDIT_NOTE || documentType == DocumentType.DEBIT_NOTE;

        if (!requiresReference) {
            return null;
        }

        Invoice referenceInvoice = repo.findByIdAndTenantIdAndCompanyId(referenceInvoiceId, tenantId, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Reference invoice not found: " + referenceInvoiceId));

        if (referenceInvoice.getDocumentType() != DocumentType.TAX_INVOICE) {
            throw new IllegalArgumentException("Reference invoice must be a tax invoice");
        }

        if (referenceInvoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new IllegalArgumentException("Reference invoice cannot be cancelled");
        }

        if (!customerId.equals(referenceInvoice.getCustomerId())) {
            throw new IllegalArgumentException("Reference invoice customer must match selected customer");
        }

        return referenceInvoice;
    }

    private Invoice resolveAndValidateSourceProforma(
            Long tenantId,
            Long companyId,
            Long customerId,
            DocumentType documentType,
            Long sourceProformaId
    ) {
        if (documentType != DocumentType.TAX_INVOICE || sourceProformaId == null) {
            return null;
        }

        Invoice sourceProforma = repo.findByIdAndTenantIdAndCompanyId(sourceProformaId, tenantId, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Source proforma not found: " + sourceProformaId));

        if (sourceProforma.getDocumentType() != DocumentType.PROFORMA_INVOICE) {
            throw new IllegalArgumentException("Source document must be a proforma invoice");
        }

        if (!customerId.equals(sourceProforma.getCustomerId())) {
            throw new IllegalArgumentException("Source proforma customer must match selected customer");
        }

        if (sourceProforma.getStatus() == InvoiceStatus.CANCELLED) {
            throw new IllegalArgumentException("Cancelled proforma invoice cannot be converted");
        }

        if (sourceProforma.getStatus() == InvoiceStatus.CONVERTED || sourceProforma.getConvertedToInvoiceId() != null) {
            throw new IllegalArgumentException("Proforma invoice has already been converted");
        }

        if (isProformaExpired(sourceProforma)) {
            throw new IllegalArgumentException("Expired proforma invoice cannot be converted");
        }

        return sourceProforma;
    }

    private void validateProformaConvertible(Invoice invoice) {
        if (invoice.getDocumentType() != DocumentType.PROFORMA_INVOICE) {
            throw new IllegalArgumentException("Only proforma invoices can be converted");
        }

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new IllegalArgumentException("Cancelled proforma invoice cannot be converted");
        }

        if (invoice.getStatus() == InvoiceStatus.CONVERTED || invoice.getConvertedToInvoiceId() != null) {
            throw new IllegalArgumentException("Proforma invoice has already been converted");
        }

        if (isProformaExpired(invoice)) {
            throw new IllegalArgumentException("Expired proforma invoice cannot be converted");
        }
    }

    private boolean isProformaExpired(Invoice invoice) {
        return invoice.getDocumentType() == DocumentType.PROFORMA_INVOICE
                && invoice.getStatus() == InvoiceStatus.ISSUED
                && invoice.getValidUntil() != null
                && invoice.getValidUntil().isBefore(LocalDate.now());
    }

    private InvoiceStatus resolveStatus(Invoice invoice) {
        if (isProformaExpired(invoice)) {
            return InvoiceStatus.EXPIRED;
        }
        return invoice.getStatus();
    }

    private Long getTenantIdOrThrow() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant in request context");
        }
        return tenantId;
    }

    private Long getCompanyIdOrThrow() {
        Long companyId = CompanyContext.get();
        if (companyId == null) {
            throw new IllegalStateException("No company in request context");
        }
        return companyId;
    }

    private LocalDate resolveDueDate(LocalDate invoiceDate, Integer paymentTermsDays) {
        int days = paymentTermsDays == null ? 0 : Math.max(paymentTermsDays, 0);
        return invoiceDate.plusDays(days);
    }

    private TaxType resolveTaxType(String sellerStateCode, String buyerStateCode, String buyerGstin) {
        if (buyerGstin == null || buyerGstin.isBlank()) {
            if (sellerStateCode != null && sellerStateCode.equalsIgnoreCase(buyerStateCode)) {
                return TaxType.INTRA_STATE;
            }
            return TaxType.INTER_STATE;
        }

        if (sellerStateCode != null && sellerStateCode.equalsIgnoreCase(buyerStateCode)) {
            return TaxType.INTRA_STATE;
        }

        return TaxType.INTER_STATE;
    }

    private void snapshotCustomer(Invoice invoice, Customer customer) {
        invoice.setCustomerId(customer.getId());
        invoice.setCustomerCode(customer.getCode());
        invoice.setCustomerLegalName(customer.getLegalName());
        invoice.setCustomerTradeName(customer.getTradeName());
        invoice.setCustomerGstin(customer.getGstin());
        invoice.setCustomerBillingAddressLine1(customer.getBillingAddressLine1());
        invoice.setCustomerBillingAddressLine2(customer.getBillingAddressLine2());
        invoice.setCustomerBillingCity(customer.getBillingCity());
        invoice.setCustomerBillingState(customer.getBillingState());
        invoice.setCustomerBillingStateCode(customer.getBillingStateCode());
        invoice.setCustomerBillingPincode(customer.getBillingPincode());
        invoice.setCustomerBillingCountry(customer.getBillingCountry());
    }

    private void snapshotSeller(Invoice invoice, Company company) {
        invoice.setSellerLegalName(company.getName());
        invoice.setSellerGstin(company.getGstin());
        invoice.setSellerAddressLine1(company.getAddressLine1());
        invoice.setSellerAddressLine2(company.getAddressLine2());
        invoice.setSellerCity(company.getCity());
        invoice.setSellerState(company.getState());
        invoice.setSellerStateCode(company.getStateCode());
        invoice.setSellerPincode(company.getPincode());
        invoice.setSellerCountry(company.getCountry());
    }

    private InvoiceLine buildInvoiceLine(
            Invoice invoice,
            Product product,
            HsnSacMaster hsnSac,
            UnitMaster unit,
            GstSlabMaster gstSlab,
            CreateInvoiceLineRequest reqLine,
            TaxType taxType,
            int lineNo
    ) {
        BigDecimal qty = scale(reqLine.getQuantity(), 3);
        BigDecimal unitPrice = money(reqLine.getUnitPrice());
        BigDecimal taxable = money(qty.multiply(unitPrice));

        BigDecimal gstRate = scale(gstSlab.getRate(), 2);
        BigDecimal cgstRate = scale(0, 2);
        BigDecimal sgstRate = scale(0, 2);
        BigDecimal igstRate = scale(0, 2);

        if (taxType == TaxType.INTRA_STATE) {
            cgstRate = scale(gstRate.divide(new BigDecimal("2"), 2, BigDecimal.ROUND_HALF_UP), 2);
            sgstRate = scale(gstRate.divide(new BigDecimal("2"), 2, BigDecimal.ROUND_HALF_UP), 2);
        } else if (taxType == TaxType.INTER_STATE) {
            igstRate = gstRate;
        }

        BigDecimal cgstAmount = percentOf(taxable, cgstRate);
        BigDecimal sgstAmount = percentOf(taxable, sgstRate);
        BigDecimal igstAmount = percentOf(taxable, igstRate);
        BigDecimal total = taxable.add(cgstAmount).add(sgstAmount).add(igstAmount);

        return InvoiceLine.builder()
                .invoice(invoice)
                .lineNo(lineNo)
                .productId(product.getId())
                .productCode(product.getCode())
                .productName(product.getName())
                .description(
                        reqLine.getDescription() != null && !reqLine.getDescription().isBlank()
                                ? reqLine.getDescription().trim()
                                : product.getDescription()
                )
                .hsnSacCode(hsnSac.getCode())
                .unitCode(unit.getCode())
                .quantity(qty)
                .unitPrice(unitPrice)
                .taxableAmount(taxable)
                .gstRate(gstRate)
                .cgstRate(cgstRate)
                .sgstRate(sgstRate)
                .igstRate(igstRate)
                .cgstAmount(cgstAmount)
                .sgstAmount(sgstAmount)
                .igstAmount(igstAmount)
                .lineTotalAmount(total)
                .build();
    }

    private BigDecimal percentOf(BigDecimal base, BigDecimal rate) {
        return money(base.multiply(rate).divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP));
    }

    private BigDecimal money(Number value) {
        return new BigDecimal(String.valueOf(value)).setScale(2, BigDecimal.ROUND_HALF_UP);
    }

    private BigDecimal scale(Number value, int scale) {
        return new BigDecimal(String.valueOf(value)).setScale(scale, BigDecimal.ROUND_HALF_UP);
    }

    private InvoiceDto toDto(Invoice invoice) {
        InvoiceDto dto = new InvoiceDto();
        dto.setId(invoice.getId());
        dto.setTenantId(invoice.getTenantId());
        dto.setCompanyId(invoice.getCompanyId());
        dto.setDocumentType(invoice.getDocumentType());
        dto.setReferenceInvoiceId(invoice.getReferenceInvoiceId());
        dto.setReferenceInvoiceNo(invoice.getReferenceInvoiceNo());

        dto.setSourceProformaId(invoice.getSourceProformaId());
        dto.setConvertedToInvoiceId(invoice.getConvertedToInvoiceId());
        dto.setConvertedAt(invoice.getConvertedAt());
        dto.setValidUntil(invoice.getValidUntil());

        dto.setInvoiceNo(invoice.getInvoiceNo());
        dto.setInvoiceDate(invoice.getInvoiceDate());
        dto.setDueDate(invoice.getDueDate());
        dto.setStatus(resolveStatus(invoice));
        dto.setTaxType(invoice.getTaxType());
        dto.setPlaceOfSupplyStateCode(invoice.getPlaceOfSupplyStateCode());
        dto.setNotes(invoice.getNotes());
        dto.setTermsAndConditions(invoice.getTermsAndConditions());

        dto.setCustomerId(invoice.getCustomerId());
        dto.setCustomerCode(invoice.getCustomerCode());
        dto.setCustomerLegalName(invoice.getCustomerLegalName());
        dto.setCustomerTradeName(invoice.getCustomerTradeName());
        dto.setCustomerGstin(invoice.getCustomerGstin());
        dto.setCustomerBillingAddressLine1(invoice.getCustomerBillingAddressLine1());
        dto.setCustomerBillingAddressLine2(invoice.getCustomerBillingAddressLine2());
        dto.setCustomerBillingCity(invoice.getCustomerBillingCity());
        dto.setCustomerBillingState(invoice.getCustomerBillingState());
        dto.setCustomerBillingStateCode(invoice.getCustomerBillingStateCode());
        dto.setCustomerBillingPincode(invoice.getCustomerBillingPincode());
        dto.setCustomerBillingCountry(invoice.getCustomerBillingCountry());

        dto.setSellerLegalName(invoice.getSellerLegalName());
        dto.setSellerGstin(invoice.getSellerGstin());
        dto.setSellerAddressLine1(invoice.getSellerAddressLine1());
        dto.setSellerAddressLine2(invoice.getSellerAddressLine2());
        dto.setSellerCity(invoice.getSellerCity());
        dto.setSellerState(invoice.getSellerState());
        dto.setSellerStateCode(invoice.getSellerStateCode());
        dto.setSellerPincode(invoice.getSellerPincode());
        dto.setSellerCountry(invoice.getSellerCountry());

        dto.setTotalTaxableAmount(invoice.getTotalTaxableAmount());
        dto.setTotalCgstAmount(invoice.getTotalCgstAmount());
        dto.setTotalSgstAmount(invoice.getTotalSgstAmount());
        dto.setTotalIgstAmount(invoice.getTotalIgstAmount());
        dto.setTotalTaxAmount(invoice.getTotalTaxAmount());
        dto.setTotalInvoiceAmount(invoice.getTotalInvoiceAmount());

        dto.setLines(invoice.getLines().stream().map(this::toLineDto).toList());

        dto.setCreatedAt(invoice.getCreatedAt());
        dto.setUpdatedAt(invoice.getUpdatedAt());
        dto.setCreatedBy(invoice.getCreatedBy());
        dto.setUpdatedBy(invoice.getUpdatedBy());
        dto.setVersion(invoice.getVersion());

        return dto;
    }

    private InvoiceLineDto toLineDto(InvoiceLine line) {
        InvoiceLineDto dto = new InvoiceLineDto();
        dto.setId(line.getId());
        dto.setLineNo(line.getLineNo());
        dto.setProductId(line.getProductId());
        dto.setProductCode(line.getProductCode());
        dto.setProductName(line.getProductName());
        dto.setDescription(line.getDescription());
        dto.setHsnSacCode(line.getHsnSacCode());
        dto.setUnitCode(line.getUnitCode());
        dto.setQuantity(line.getQuantity());
        dto.setUnitPrice(line.getUnitPrice());
        dto.setTaxableAmount(line.getTaxableAmount());
        dto.setGstRate(line.getGstRate());
        dto.setCgstRate(line.getCgstRate());
        dto.setSgstRate(line.getSgstRate());
        dto.setIgstRate(line.getIgstRate());
        dto.setCgstAmount(line.getCgstAmount());
        dto.setSgstAmount(line.getSgstAmount());
        dto.setIgstAmount(line.getIgstAmount());
        dto.setLineTotalAmount(line.getLineTotalAmount());
        return dto;
    }
}