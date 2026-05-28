package com.wilsonks.gstbilling;

import com.wilsonks.gstbilling.auth.access.UserAccess;
import com.wilsonks.gstbilling.auth.access.UserAccessRepository;
import com.wilsonks.gstbilling.auth.identity.Role;
import com.wilsonks.gstbilling.auth.identity.User;
import com.wilsonks.gstbilling.auth.identity.UserRepository;
import com.wilsonks.gstbilling.auth.identity.UserScope;
import com.wilsonks.gstbilling.company.Company;
import com.wilsonks.gstbilling.company.CompanyRepository;
import com.wilsonks.gstbilling.company.CompanyType;
import com.wilsonks.gstbilling.customer.Customer;
import com.wilsonks.gstbilling.customer.CustomerRepository;
import com.wilsonks.gstbilling.customer.CustomerType;
import com.wilsonks.gstbilling.customer.GstRegistrationType;
import com.wilsonks.gstbilling.invoice.Invoice;
import com.wilsonks.gstbilling.invoice.InvoiceLine;
import com.wilsonks.gstbilling.invoice.InvoiceRepository;
import com.wilsonks.gstbilling.invoice.InvoiceStatus;
import com.wilsonks.gstbilling.invoice.TaxType;
import com.wilsonks.gstbilling.invoice.sequence.DocumentType;
import com.wilsonks.gstbilling.invoice.sequence.FinancialYearUtil;
import com.wilsonks.gstbilling.invoice.sequence.InvoiceSequence;
import com.wilsonks.gstbilling.invoice.sequence.InvoiceSequenceRepository;
import com.wilsonks.gstbilling.invoice.sequence.SequenceResetPolicy;
import com.wilsonks.gstbilling.master.gst.GstSlabMaster;
import com.wilsonks.gstbilling.master.gst.GstSlabMasterRepository;
import com.wilsonks.gstbilling.master.hsn.HsnSacMaster;
import com.wilsonks.gstbilling.master.hsn.HsnSacMasterRepository;
import com.wilsonks.gstbilling.master.hsn.HsnSacType;
import com.wilsonks.gstbilling.master.unit.UnitMaster;
import com.wilsonks.gstbilling.master.unit.UnitMasterRepository;
import com.wilsonks.gstbilling.platform.billing.entity.SubscriptionInvoice;
import com.wilsonks.gstbilling.platform.billing.entity.SubscriptionPayment;
import com.wilsonks.gstbilling.platform.billing.entity.TenantSubscription;
import com.wilsonks.gstbilling.platform.billing.model.BillingCycle;
import com.wilsonks.gstbilling.platform.billing.model.PaymentMode;
import com.wilsonks.gstbilling.platform.billing.model.PaymentStatus;
import com.wilsonks.gstbilling.platform.billing.model.SubscriptionInvoiceStatus;
import com.wilsonks.gstbilling.platform.billing.model.SubscriptionStatus;
import com.wilsonks.gstbilling.platform.billing.repo.SubscriptionInvoiceRepository;
import com.wilsonks.gstbilling.platform.billing.repo.SubscriptionPaymentRepository;
import com.wilsonks.gstbilling.platform.billing.repo.TenantSubscriptionRepository;
import com.wilsonks.gstbilling.platform.tenant.Tenant;
import com.wilsonks.gstbilling.platform.tenant.TenantRepository;
import com.wilsonks.gstbilling.product.Product;
import com.wilsonks.gstbilling.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DemoSeeder implements ApplicationRunner {

    private final UserRepository userRepo;
    private final CompanyRepository companyRepo;
    private final UserAccessRepository accessRepo;
    private final TenantRepository tenantRepo;
    private final PasswordEncoder encoder;

    private final TenantSubscriptionRepository tenantSubscriptionRepository;
    private final SubscriptionInvoiceRepository subscriptionInvoiceRepository;
    private final SubscriptionPaymentRepository subscriptionPaymentRepository;

    private final GstSlabMasterRepository gstSlabMasterRepository;
    private final UnitMasterRepository unitMasterRepository;
    private final HsnSacMasterRepository hsnSacMasterRepository;
    private final ProductRepository productRepository;

    private final CustomerRepository customerRepository;
    private final InvoiceSequenceRepository invoiceSequenceRepository;
    private final InvoiceRepository invoiceRepository;

    @Override
    public void run(ApplicationArguments args) {
        seedMasters();

        upsertPlatformUser(
                "root",
                "root@local.com",
                "root@1234",
                List.of("SUPER_ADMIN")
        );

        String financialYear = FinancialYearUtil.currentFinancialYear();

        for (int i = 1; i <= 20; i++) {
            String tenantName = "Demo Tenant " + i;
            String gstin = generateGstin(i);
            String companyEmail = "demo" + i + "@company.com";

            Tenant tenant = upsertTenant(tenantName, gstin, companyEmail);

            User tenantAdmin = upsertTenantUser(
                    "tenantadmin" + i,
                    "tenantadmin" + i + "@local.com",
                    "admin@1234",
                    tenant.getTenantId(),
                    List.of("ADMIN")
            );

            Company demoCompany = upsertDemoCompany(
                    "Demo Company " + i,
                    gstin,
                    companyEmail,
                    tenant.getTenantId()
            );

            upsertAccess(tenantAdmin.getId(), demoCompany.getId(), tenant.getTenantId(), Role.ADMIN);

            TenantSubscription subscription = upsertSubscription(tenant, i);
            SubscriptionInvoice subscriptionInvoice = upsertLatestInvoice(subscription, tenant, i);
            upsertPaymentForInvoice(subscriptionInvoice, tenant, i);

            seedProductsForTenant(tenant, i);

            Customer customer = upsertDemoCustomer(tenant.getTenantId(), i);
            upsertInvoiceSequence(tenant.getTenantId(), demoCompany.getId(), financialYear);
            seedSampleInvoice(tenant.getTenantId(), demoCompany, customer, i, financialYear);
        }
    }

    private void seedMasters() {
        GstSlabMaster gst0 = upsertGstSlab("GST_0", "GST 0%", new BigDecimal("0.00"));
        GstSlabMaster gst5 = upsertGstSlab("GST_5", "GST 5%", new BigDecimal("5.00"));
        GstSlabMaster gst12 = upsertGstSlab("GST_12", "GST 12%", new BigDecimal("12.00"));
        GstSlabMaster gst18 = upsertGstSlab("GST_18", "GST 18%", new BigDecimal("18.00"));
        GstSlabMaster gst28 = upsertGstSlab("GST_28", "GST 28%", new BigDecimal("28.00"));

        upsertUnit("NOS", "Numbers", "Nos");
        upsertUnit("PCS", "Pieces", "Pcs");
        upsertUnit("BOX", "Box", "Box");
        upsertUnit("MONTH", "Month", "Mon");
        upsertUnit("YEAR", "Year", "Yr");
        upsertUnit("USER", "User", "User");
        upsertUnit("LICENSE", "License", "Lic");

        upsertHsnSac("998313", "Information technology consulting and support services", HsnSacType.SAC, gst18);
        upsertHsnSac("998314", "Software design and development services", HsnSacType.SAC, gst18);
        upsertHsnSac("998315", "Hosting and IT infrastructure provisioning services", HsnSacType.SAC, gst18);
        upsertHsnSac("847130", "Portable digital automatic data processing machines", HsnSacType.HSN, gst18);
        upsertHsnSac("852349", "Software media and packaged software supplies", HsnSacType.HSN, gst18);
        upsertHsnSac("490700", "Printed books and similar educational material", HsnSacType.HSN, gst0);
        upsertHsnSac("940360", "Office furniture and fixtures", HsnSacType.HSN, gst28);
        upsertHsnSac("441112", "Paper-based office consumables and stationery bundles", HsnSacType.HSN, gst12);
        upsertHsnSac("210690", "Packaged food and pantry supplies", HsnSacType.HSN, gst5);
    }

    private String generateGstin(int i) {
        String stateCode = String.format("%02d", 10 + (i % 25));
        String pan = String.format("ABCDE%04dF", i);
        String entity = String.valueOf((i % 9) + 1);
        return stateCode + pan + entity + "Z5";
    }

    private void upsertPlatformUser(
            String username,
            String email,
            String rawPassword,
            List<String> roles
    ) {
        User user = userRepo.findByUsername(username).orElseGet(User::new);

        user.setUsername(username);
        user.setEmail(email);

        if (user.getId() == null) {
            user.setPassword(encoder.encode(rawPassword));
        }

        user.setScope(UserScope.PLATFORM);
        user.setTenantId(null);
        user.setRoles(roles);

        userRepo.save(user);
    }

    private Tenant upsertTenant(String name, String gstin, String contactEmail) {
        Tenant tenant = tenantRepo.findByGstinIgnoreCase(gstin).orElseGet(Tenant::new);

        tenant.setName(name);
        tenant.setGstin(gstin);
        tenant.setContactEmail(contactEmail);
        tenant.setActive(true);

        return tenantRepo.save(tenant);
    }

    private User upsertTenantUser(
            String username,
            String email,
            String rawPassword,
            Long tenantId,
            List<String> roles
    ) {
        User user = userRepo.findByUsername(username).orElseGet(User::new);

        user.setUsername(username);
        user.setEmail(email);

        if (user.getId() == null) {
            user.setPassword(encoder.encode(rawPassword));
        }

        user.setScope(UserScope.TENANT);
        user.setTenantId(tenantId);
        user.setRoles(roles);

        return userRepo.save(user);
    }

    private Company upsertDemoCompany(
            String name,
            String gstin,
            String email,
            Long tenantId
    ) {
        Company company = companyRepo.findByGstin(gstin).orElseGet(Company::new);

        company.setName(name);
        company.setLegalName(name + " Pvt Ltd");
        company.setTradeName(name);
        company.setGstin(gstin);
        company.setEmail(email);
        company.setTenantId(tenantId);
        company.setActive(true);
        company.setType(resolveCompanyType(tenantId));
        company.setPhone("987654" + String.format("%04d", tenantId % 10000));
        company.setAddressLine1("No. " + tenantId + ", GST Business Park");
        company.setAddressLine2("Phase 1, Industrial Layout");
        company.setCity(resolveCity(tenantId));
        company.setState(resolveState(gstin));
        company.setCountry("India");

        if (gstin != null && gstin.length() >= 12) {
            company.setStateCode(gstin.substring(0, 2));
            company.setPan(gstin.substring(2, 12));
        }

        company.setPincode("560" + String.format("%03d", tenantId % 1000));

        return companyRepo.save(company);
    }

    private Customer upsertDemoCustomer(Long tenantId, int index) {
        String code = "CUST-" + String.format("%03d", index);
        String gstin = generateCustomerGstin(index);

        Customer customer = customerRepository.findByTenantIdAndCodeIgnoreCase(tenantId, code)
                .orElseGet(Customer::new);

        customer.setTenantId(tenantId);
        customer.setCode(code);
        customer.setLegalName("Customer " + index + " Private Limited");
        customer.setTradeName("Customer " + index);
        customer.setCustomerType(CustomerType.BUSINESS);
        customer.setGstRegistrationType(GstRegistrationType.REGISTERED);
        customer.setGstin(gstin);
        customer.setPan(gstin.substring(2, 12));
        customer.setContactPerson("Accounts Manager " + index);
        customer.setPhone("900000" + String.format("%04d", index));
        customer.setEmail("customer" + index + "@mail.com");

        customer.setBillingAddressLine1("Plot " + index + ", Tech Park");
        customer.setBillingAddressLine2("Commercial Zone");
        customer.setBillingCity(resolveCustomerCity(index));
        customer.setBillingState(resolveState(gstin));
        customer.setBillingStateCode(gstin.substring(0, 2));
        customer.setBillingPincode("600" + String.format("%03d", index % 1000));
        customer.setBillingCountry("India");

        customer.setShippingSameAsBilling(true);
        customer.setShippingAddressLine1(customer.getBillingAddressLine1());
        customer.setShippingAddressLine2(customer.getBillingAddressLine2());
        customer.setShippingCity(customer.getBillingCity());
        customer.setShippingState(customer.getBillingState());
        customer.setShippingStateCode(customer.getBillingStateCode());
        customer.setShippingPincode(customer.getBillingPincode());
        customer.setShippingCountry(customer.getBillingCountry());

        customer.setPaymentTermsDays((index % 3 == 0) ? 15 : 30);
        customer.setActive(true);

        return customerRepository.save(customer);
    }

    private void upsertAccess(Long userId, Long companyId, Long tenantId, Role role) {
        UserAccess access = accessRepo.findByUserIdAndCompanyId(userId, companyId)
                .orElseGet(UserAccess::new);

        access.setUserId(userId);
        access.setCompanyId(companyId);
        access.setTenantId(tenantId);
        access.setRole(role);
        access.setActive(true);

        accessRepo.save(access);
    }

    private TenantSubscription upsertSubscription(Tenant tenant, int index) {
        TenantSubscription subscription = tenantSubscriptionRepository
                .findByTenantId(tenant.getTenantId())
                .orElseGet(TenantSubscription::new);

        PlanSeed planSeed = resolvePlan(index);
        OffsetDateTime now = OffsetDateTime.now();

        subscription.setTenantId(tenant.getTenantId());
        subscription.setPlanCode(planSeed.planCode());
        subscription.setPlanName(planSeed.planName());
        subscription.setBillingCycle(planSeed.billingCycle());
        subscription.setBaseAmount(planSeed.baseAmount());
        subscription.setGstRate(18);
        subscription.setMrr(planSeed.mrr());
        subscription.setArr(planSeed.arr());
        subscription.setSubscriptionStatus(planSeed.subscriptionStatus());
        subscription.setStartedAt(LocalDate.now().minusMonths(index));
        subscription.setRenewedAt(LocalDate.now().minusDays(index % 20));
        subscription.setNextRenewalDate(resolveNextRenewalDate(index, planSeed.billingCycle()));
        subscription.setCancelledAt(
                planSeed.subscriptionStatus() == SubscriptionStatus.CANCELLED
                        ? LocalDate.now().minusDays(1)
                        : null
        );
        subscription.setActive(planSeed.subscriptionStatus() != SubscriptionStatus.CANCELLED);

        if (subscription.getId() == null) {
            subscription.setCreatedAt(now);
            subscription.setCreatedBy("demo-seeder");
            subscription.setVersion(0L);
        }

        subscription.setUpdatedAt(now);
        subscription.setUpdatedBy("demo-seeder");

        return tenantSubscriptionRepository.save(subscription);
    }

    private SubscriptionInvoice upsertLatestInvoice(TenantSubscription subscription, Tenant tenant, int index) {
        String invoiceNo = "SAS-INV-2026-" + String.format("%03d", 100 + index);

        SubscriptionInvoice invoice = subscriptionInvoiceRepository.findByInvoiceNo(invoiceNo)
                .orElseGet(SubscriptionInvoice::new);

        BigDecimal baseAmount = defaultAmount(subscription.getBaseAmount());
        BigDecimal gstAmount = baseAmount.multiply(new BigDecimal("0.18"))
                .setScale(2, BigDecimal.ROUND_HALF_UP);
        BigDecimal totalAmount = baseAmount.add(gstAmount);

        SubscriptionInvoiceStatus status = resolveInvoiceStatus(index);
        OffsetDateTime now = OffsetDateTime.now();

        invoice.setInvoiceNo(invoiceNo);
        invoice.setTenantId(tenant.getTenantId());
        invoice.setSubscriptionId(subscription.getId());
        invoice.setPeriodLabel(resolvePeriodLabel(subscription.getBillingCycle()));
        invoice.setAmountBeforeTax(baseAmount);
        invoice.setGstAmount(gstAmount);
        invoice.setTotalAmount(totalAmount);
        invoice.setIssuedOn(LocalDate.now().minusDays(index));
        invoice.setDueOn(resolveDueDate(index, status));
        invoice.setPaidOn(status == SubscriptionInvoiceStatus.PAID
                ? LocalDate.now().minusDays(Math.max(0, index % 5))
                : null);
        invoice.setStatus(status);

        if (invoice.getId() == null) {
            invoice.setCreatedAt(now);
            invoice.setCreatedBy("demo-seeder");
            invoice.setVersion(0L);
        }

        invoice.setUpdatedAt(now);
        invoice.setUpdatedBy("demo-seeder");

        return subscriptionInvoiceRepository.save(invoice);
    }

    private void upsertPaymentForInvoice(SubscriptionInvoice invoice, Tenant tenant, int index) {
        if (invoice.getStatus() != SubscriptionInvoiceStatus.PAID) {
            return;
        }

        List<SubscriptionPayment> existingPayments = subscriptionPaymentRepository.findByInvoiceId(invoice.getId());
        if (!existingPayments.isEmpty()) {
            return;
        }

        OffsetDateTime now = OffsetDateTime.now();

        SubscriptionPayment payment = SubscriptionPayment.builder()
                .tenantId(tenant.getTenantId())
                .invoiceId(invoice.getId())
                .amountPaid(defaultAmount(invoice.getTotalAmount()))
                .paymentDate(invoice.getPaidOn() != null ? invoice.getPaidOn() : LocalDate.now())
                .paymentMode(resolvePaymentMode(index))
                .referenceNo("PAY-REF-" + invoice.getInvoiceNo())
                .status(PaymentStatus.PAID)
                .createdAt(now)
                .updatedAt(now)
                .createdBy("demo-seeder")
                .updatedBy("demo-seeder")
                .version(0L)
                .build();

        subscriptionPaymentRepository.save(payment);
    }

    private void seedProductsForTenant(Tenant tenant, int index) {
        UnitMaster licenseUnit = getUnitByCode("LICENSE");
        UnitMaster userUnit = getUnitByCode("USER");
        UnitMaster monthUnit = getUnitByCode("MONTH");
        UnitMaster nosUnit = getUnitByCode("NOS");
        UnitMaster boxUnit = getUnitByCode("BOX");

        HsnSacMaster softwareDev = getHsnSacByCode("998314");
        HsnSacMaster itSupport = getHsnSacByCode("998313");
        HsnSacMaster hosting = getHsnSacByCode("998315");
        HsnSacMaster packagedSoftware = getHsnSacByCode("852349");
        HsnSacMaster officeFurniture = getHsnSacByCode("940360");

        upsertProduct(
                tenant.getTenantId(),
                "GST-SOFT-" + index,
                "GST Billing Software " + index,
                "Core GST billing application license for tenant " + index,
                new BigDecimal("4999.00"),
                softwareDev,
                licenseUnit,
                softwareDev.getDefaultGstSlab(),
                true
        );

        upsertProduct(
                tenant.getTenantId(),
                "GST-SUPPORT-" + index,
                "Support Plan " + index,
                "Managed application support and helpdesk services",
                new BigDecimal("1999.00"),
                itSupport,
                monthUnit,
                itSupport.getDefaultGstSlab(),
                true
        );

        upsertProduct(
                tenant.getTenantId(),
                "GST-USR-" + index,
                "Additional User Pack " + index,
                "Per-user add-on pack for billing operations",
                new BigDecimal("299.00"),
                hosting,
                userUnit,
                hosting.getDefaultGstSlab(),
                true
        );

        upsertProduct(
                tenant.getTenantId(),
                "GST-KIT-" + index,
                "Implementation Kit " + index,
                "One-time implementation starter kit",
                new BigDecimal("1499.00"),
                packagedSoftware,
                nosUnit,
                packagedSoftware.getDefaultGstSlab(),
                true
        );

        if (index % 3 == 0) {
            upsertProduct(
                    tenant.getTenantId(),
                    "GST-FURN-" + index,
                    "Office Setup Bundle " + index,
                    "Demo office setup and hardware support bundle",
                    new BigDecimal("8999.00"),
                    officeFurniture,
                    boxUnit,
                    officeFurniture.getDefaultGstSlab(),
                    index % 2 == 0
            );
        }
    }

    private void upsertInvoiceSequence(Long tenantId, Long companyId, String financialYear) {
        InvoiceSequence existing = invoiceSequenceRepository
                .findByTenantIdAndCompanyIdAndDocumentTypeAndFinancialYear(
                        tenantId,
                        companyId,
                        DocumentType.TAX_INVOICE,
                        financialYear
                )
                .orElseGet(InvoiceSequence::new);

        existing.setTenantId(tenantId);
        existing.setCompanyId(companyId);
        existing.setDocumentType(DocumentType.TAX_INVOICE);
        existing.setFinancialYear(financialYear);
        existing.setPrefix("INV/" + financialYear + "/");
        existing.setSuffix(null);
        existing.setPaddingLength(5);
        existing.setResetPolicy(SequenceResetPolicy.FINANCIAL_YEAR);
        existing.setActive(true);

        if (existing.getId() == null) {
            existing.setCurrentNumber(0L);
        }

        invoiceSequenceRepository.save(existing);
    }

    private void seedSampleInvoice(
            Long tenantId,
            Company company,
            Customer customer,
            int index,
            String financialYear
    ) {
        String invoiceNo = "INV/" + financialYear + "/" + String.format("%05d", index);

        if (invoiceRepository.findByTenantIdAndCompanyIdAndInvoiceNo(tenantId, company.getId(), invoiceNo).isPresent()) {
            return;
        }

        List<Product> products = productRepository.findByTenantId(tenantId);
        if (products.isEmpty()) {
            return;
        }

        Product firstProduct = products.get(0);
        Product secondProduct = products.size() > 1 ? products.get(1) : products.get(0);

        HsnSacMaster firstHsn = hsnSacMasterRepository.findById(firstProduct.getHsnSacId())
                .orElseThrow(() -> new IllegalStateException("HSN/SAC missing for product " + firstProduct.getId()));
        UnitMaster firstUnit = unitMasterRepository.findById(firstProduct.getUnitId())
                .orElseThrow(() -> new IllegalStateException("Unit missing for product " + firstProduct.getId()));
        GstSlabMaster firstSlab = gstSlabMasterRepository.findById(firstProduct.getGstSlabId())
                .orElseThrow(() -> new IllegalStateException("GST slab missing for product " + firstProduct.getId()));

        HsnSacMaster secondHsn = hsnSacMasterRepository.findById(secondProduct.getHsnSacId())
                .orElseThrow(() -> new IllegalStateException("HSN/SAC missing for product " + secondProduct.getId()));
        UnitMaster secondUnit = unitMasterRepository.findById(secondProduct.getUnitId())
                .orElseThrow(() -> new IllegalStateException("Unit missing for product " + secondProduct.getId()));
        GstSlabMaster secondSlab = gstSlabMasterRepository.findById(secondProduct.getGstSlabId())
                .orElseThrow(() -> new IllegalStateException("GST slab missing for product " + secondProduct.getId()));

        TaxType taxType = resolveTaxType(company.getStateCode(), customer.getBillingStateCode(), customer.getGstin());

        Invoice invoice = new Invoice();
        invoice.setTenantId(tenantId);
        invoice.setCompanyId(company.getId());
        invoice.setInvoiceNo(invoiceNo);
        invoice.setInvoiceDate(LocalDate.now().minusDays(index % 10));
        invoice.setDueDate(invoice.getInvoiceDate().plusDays(customer.getPaymentTermsDays()));
        invoice.setStatus(index % 7 == 0 ? InvoiceStatus.CANCELLED : InvoiceStatus.ISSUED);
        invoice.setTaxType(taxType);
        invoice.setPlaceOfSupplyStateCode(customer.getBillingStateCode());
        invoice.setNotes("Demo invoice generated by seed data");
        invoice.setTermsAndConditions("Payment due within agreed credit period.");

        snapshotCustomer(invoice, customer);
        snapshotSeller(invoice, company);

        List<InvoiceLine> lines = new ArrayList<>();
        lines.add(buildInvoiceLine(
                invoice,
                1,
                firstProduct,
                firstHsn,
                firstUnit,
                firstSlab,
                new BigDecimal("1.000"),
                firstProduct.getDefaultPrice(),
                taxType
        ));

        lines.add(buildInvoiceLine(
                invoice,
                2,
                secondProduct,
                secondHsn,
                secondUnit,
                secondSlab,
                new BigDecimal(index % 2 == 0 ? "2.000" : "1.000"),
                secondProduct.getDefaultPrice(),
                taxType
        ));

        invoice.replaceLines(lines);

        BigDecimal totalTaxable = money(BigDecimal.ZERO);
        BigDecimal totalSgst = money(BigDecimal.ZERO);
        BigDecimal totalCgst = money(BigDecimal.ZERO);
        BigDecimal totalIgst = money(BigDecimal.ZERO);

        for (InvoiceLine line : lines) {
            totalTaxable = totalTaxable.add(line.getTaxableAmount());
            totalCgst = totalCgst.add(line.getCgstAmount());
            totalSgst = totalSgst.add(line.getSgstAmount());
            totalIgst = totalIgst.add(line.getIgstAmount());
        }

        BigDecimal totalTax = totalCgst.add(totalSgst).add(totalIgst);
        BigDecimal totalInvoiceAmount = totalTaxable.add(totalTax);

        invoice.setTotalTaxableAmount(totalTaxable);
        invoice.setTotalCgstAmount(totalCgst);
        invoice.setTotalSgstAmount(totalSgst);
        invoice.setTotalIgstAmount(totalIgst);
        invoice.setTotalTaxAmount(totalTax);
        invoice.setTotalInvoiceAmount(totalInvoiceAmount);

        invoiceRepository.save(invoice);

        InvoiceSequence sequence = invoiceSequenceRepository
                .findByTenantIdAndCompanyIdAndDocumentTypeAndFinancialYear(
                        tenantId,
                        company.getId(),
                        DocumentType.TAX_INVOICE,
                        financialYear
                )
                .orElseThrow(() -> new IllegalStateException("Invoice sequence missing"));

        long expectedCurrent = Math.max(sequence.getCurrentNumber(), index);
        sequence.setCurrentNumber(expectedCurrent);
        invoiceSequenceRepository.save(sequence);
    }

    private InvoiceLine buildInvoiceLine(
            Invoice invoice,
            int lineNo,
            Product product,
            HsnSacMaster hsnSac,
            UnitMaster unit,
            GstSlabMaster slab,
            BigDecimal quantity,
            BigDecimal unitPrice,
            TaxType taxType
    ) {
        BigDecimal qty = quantity.setScale(3, BigDecimal.ROUND_HALF_UP);
        BigDecimal price = money(unitPrice);
        BigDecimal taxable = money(qty.multiply(price));

        BigDecimal gstRate = slab.getRate().setScale(2, BigDecimal.ROUND_HALF_UP);
        BigDecimal cgstRate = BigDecimal.ZERO.setScale(2, BigDecimal.ROUND_HALF_UP);
        BigDecimal sgstRate = BigDecimal.ZERO.setScale(2, BigDecimal.ROUND_HALF_UP);
        BigDecimal igstRate = BigDecimal.ZERO.setScale(2, BigDecimal.ROUND_HALF_UP);

        if (taxType == TaxType.INTRA_STATE) {
            cgstRate = gstRate.divide(new BigDecimal("2"), 2, BigDecimal.ROUND_HALF_UP);
            sgstRate = gstRate.divide(new BigDecimal("2"), 2, BigDecimal.ROUND_HALF_UP);
        } else if (taxType == TaxType.INTER_STATE) {
            igstRate = gstRate;
        }

        BigDecimal cgstAmount = percentOf(taxable, cgstRate);
        BigDecimal sgstAmount = percentOf(taxable, sgstRate);
        BigDecimal igstAmount = percentOf(taxable, igstRate);
        BigDecimal lineTotal = taxable.add(cgstAmount).add(sgstAmount).add(igstAmount);

        return InvoiceLine.builder()
                .invoice(invoice)
                .lineNo(lineNo)
                .productId(product.getId())
                .productCode(product.getCode())
                .productName(product.getName())
                .description(product.getDescription())
                .hsnSacCode(hsnSac.getCode())
                .unitCode(unit.getCode())
                .quantity(qty)
                .unitPrice(price)
                .taxableAmount(taxable)
                .gstRate(gstRate)
                .cgstRate(cgstRate)
                .sgstRate(sgstRate)
                .igstRate(igstRate)
                .cgstAmount(cgstAmount)
                .sgstAmount(sgstAmount)
                .igstAmount(igstAmount)
                .lineTotalAmount(lineTotal)
                .build();
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
        invoice.setSellerLegalName(
                company.getLegalName() != null && !company.getLegalName().isBlank()
                        ? company.getLegalName()
                        : company.getName()
        );
        invoice.setSellerGstin(company.getGstin());
        invoice.setSellerAddressLine1(company.getAddressLine1());
        invoice.setSellerAddressLine2(company.getAddressLine2());
        invoice.setSellerCity(company.getCity());
        invoice.setSellerState(company.getState());
        invoice.setSellerStateCode(company.getStateCode());
        invoice.setSellerPincode(company.getPincode());
        invoice.setSellerCountry(company.getCountry());
    }

    private void upsertProduct(
            Long tenantId,
            String code,
            String name,
            String description,
            BigDecimal defaultPrice,
            HsnSacMaster hsnSac,
            UnitMaster unit,
            GstSlabMaster gstSlab,
            boolean active
    ) {
        Product product = productRepository.findByTenantIdAndCodeIgnoreCase(tenantId, code)
                .orElseGet(Product::new);

        product.setTenantId(tenantId);
        product.setCode(code);
        product.setName(name);
        product.setDescription(description);
        product.setDefaultPrice(defaultPrice);
        product.setHsnSacId(hsnSac.getId());
        product.setUnitId(unit.getId());
        product.setGstSlabId(gstSlab.getId());
        product.setActive(active);

        productRepository.save(product);
    }

    private GstSlabMaster upsertGstSlab(String code, String name, BigDecimal rate) {
        GstSlabMaster slab = gstSlabMasterRepository.findByCodeIgnoreCase(code)
                .orElseGet(GstSlabMaster::new);

        slab.setCode(code);
        slab.setName(name);
        slab.setRate(rate);
        slab.setActive(true);

        return gstSlabMasterRepository.save(slab);
    }

    private void upsertUnit(String code, String name, String symbol) {
        UnitMaster unit = unitMasterRepository.findByCodeIgnoreCase(code)
                .orElseGet(UnitMaster::new);

        unit.setCode(code);
        unit.setName(name);
        unit.setSymbol(symbol);
        unit.setActive(true);

        unitMasterRepository.save(unit);
    }

    private void upsertHsnSac(
            String code,
            String description,
            HsnSacType type,
            GstSlabMaster defaultGstSlab
    ) {
        HsnSacMaster hsnSac = hsnSacMasterRepository.findByCodeIgnoreCase(code)
                .orElseGet(HsnSacMaster::new);

        hsnSac.setCode(code);
        hsnSac.setDescription(description);
        hsnSac.setType(type);
        hsnSac.setDefaultGstSlab(defaultGstSlab);
        hsnSac.setActive(true);

        hsnSacMasterRepository.save(hsnSac);
    }

    private UnitMaster getUnitByCode(String code) {
        return unitMasterRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new IllegalStateException("Unit not found: " + code));
    }

    private HsnSacMaster getHsnSacByCode(String code) {
        return hsnSacMasterRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new IllegalStateException("HSN/SAC not found: " + code));
    }

    private CompanyType resolveCompanyType(Long tenantId) {
        int mod = (int) (tenantId % 4);
        return switch (mod) {
            case 0 -> CompanyType.PRIVATE_LIMITED;
            case 1 -> CompanyType.LLP;
            case 2 -> CompanyType.PARTNERSHIP;
            default -> CompanyType.PROPRIETORSHIP;
        };
    }

    private String resolveCity(Long tenantId) {
        return switch ((int) (tenantId % 5)) {
            case 0 -> "Bengaluru";
            case 1 -> "Hyderabad";
            case 2 -> "Chennai";
            case 3 -> "Pune";
            default -> "Mumbai";
        };
    }

    private String resolveCustomerCity(int index) {
        return switch (index % 5) {
            case 0 -> "Bengaluru";
            case 1 -> "Hyderabad";
            case 2 -> "Chennai";
            case 3 -> "Pune";
            default -> "Mumbai";
        };
    }

    private String resolveState(String gstin) {
        if (gstin == null || gstin.length() < 2) {
            return "Karnataka";
        }

        return switch (gstin.substring(0, 2)) {
            case "27" -> "Maharashtra";
            case "29" -> "Karnataka";
            case "33" -> "Tamil Nadu";
            case "36" -> "Telangana";
            case "32" -> "Kerala";
            default -> "Andhra Pradesh";
        };
    }

    private String generateCustomerGstin(int index) {
        String[] stateCodes = {"27", "29", "33", "36", "32"};
        String stateCode = stateCodes[index % stateCodes.length];
        String pan = String.format("CUSTM%04dF", index);
        String entity = String.valueOf((index % 9) + 1);
        return stateCode + pan + entity + "Z5";
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

    private PlanSeed resolvePlan(int index) {
        return switch (index % 4) {
            case 0 -> new PlanSeed(
                    "ENTERPRISE",
                    "Enterprise",
                    BillingCycle.MONTHLY,
                    new BigDecimal("16500.00"),
                    new BigDecimal("16500.00"),
                    new BigDecimal("198000.00"),
                    SubscriptionStatus.ACTIVE
            );
            case 1 -> new PlanSeed(
                    "GROWTH",
                    "Growth",
                    BillingCycle.MONTHLY,
                    new BigDecimal("5000.00"),
                    new BigDecimal("5000.00"),
                    new BigDecimal("60000.00"),
                    index % 5 == 0 ? SubscriptionStatus.SUSPENDED : SubscriptionStatus.ACTIVE
            );
            case 2 -> new PlanSeed(
                    "BUSINESS",
                    "Business",
                    BillingCycle.MONTHLY,
                    new BigDecimal("7500.00"),
                    new BigDecimal("7500.00"),
                    new BigDecimal("90000.00"),
                    index % 6 == 0 ? SubscriptionStatus.PAST_DUE : SubscriptionStatus.ACTIVE
            );
            default -> new PlanSeed(
                    "STARTER",
                    "Starter",
                    BillingCycle.ANNUAL,
                    new BigDecimal("2500.00"),
                    new BigDecimal("2500.00"),
                    new BigDecimal("30000.00"),
                    SubscriptionStatus.ACTIVE
            );
        };
    }

    private SubscriptionInvoiceStatus resolveInvoiceStatus(int index) {
        if (index % 6 == 0) {
            return SubscriptionInvoiceStatus.OVERDUE;
        }
        if (index % 5 == 0) {
            return SubscriptionInvoiceStatus.PENDING;
        }
        return SubscriptionInvoiceStatus.PAID;
    }

    private LocalDate resolveNextRenewalDate(int index, BillingCycle billingCycle) {
        if (index % 6 == 0) {
            return LocalDate.now().minusDays((index % 5) + 1);
        }
        if (billingCycle == BillingCycle.ANNUAL) {
            return LocalDate.now().plusMonths(10).plusDays(index % 20);
        }
        return LocalDate.now().plusDays((index % 9) + 1);
    }

    private LocalDate resolveDueDate(int index, SubscriptionInvoiceStatus status) {
        if (status == SubscriptionInvoiceStatus.OVERDUE) {
            return LocalDate.now().minusDays((index % 4) + 1);
        }
        return LocalDate.now().plusDays(Math.max(1, 7 - (index % 7)));
    }

    private String resolvePeriodLabel(BillingCycle billingCycle) {
        LocalDate now = LocalDate.now();
        if (billingCycle == BillingCycle.ANNUAL) {
            return String.valueOf(now.getYear());
        }
        return now.getYear() + "-" + String.format("%02d", now.getMonthValue());
    }

    private PaymentMode resolvePaymentMode(int index) {
        return switch (index % 4) {
            case 0 -> PaymentMode.BANK_TRANSFER;
            case 1 -> PaymentMode.UPI;
            case 2 -> PaymentMode.CARD;
            default -> PaymentMode.NET_BANKING;
        };
    }

    private BigDecimal defaultAmount(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private BigDecimal money(BigDecimal value) {
        return (value != null ? value : BigDecimal.ZERO).setScale(2, BigDecimal.ROUND_HALF_UP);
    }

    private BigDecimal percentOf(BigDecimal base, BigDecimal rate) {
        return money(base.multiply(rate).divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP));
    }

    private record PlanSeed(
            String planCode,
            String planName,
            BillingCycle billingCycle,
            BigDecimal baseAmount,
            BigDecimal mrr,
            BigDecimal arr,
            SubscriptionStatus subscriptionStatus
    ) {
    }
}