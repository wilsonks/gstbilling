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
import com.wilsonks.gstbilling.invoice.CreateInvoiceLineRequest;
import com.wilsonks.gstbilling.invoice.CreateInvoiceRequest;
import com.wilsonks.gstbilling.invoice.InvoiceDto;
import com.wilsonks.gstbilling.invoice.InvoiceService;
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

    private static final int TENANT_COUNT = 5;
    private static final int TOTAL_COMPANIES = 20;
    private static final int CUSTOMERS_PER_TENANT = 10;
    private static final int INVOICES_PER_COMPANY = 5;

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
    private final InvoiceService invoiceService;

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
        int companiesPerTenant = TOTAL_COMPANIES / TENANT_COUNT;

        for (int tenantIndex = 1; tenantIndex <= TENANT_COUNT; tenantIndex++) {
            String tenantName = "Demo Tenant " + tenantIndex;
            String tenantGstin = generateTenantAnchorGstin(tenantIndex);
            String tenantEmail = "tenant" + tenantIndex + "@demo.com";

            Tenant tenant = upsertTenant(tenantName, tenantGstin, tenantEmail);

            TenantSubscription subscription = upsertSubscription(tenant, tenantIndex);
            SubscriptionInvoice subscriptionInvoice = upsertLatestInvoice(subscription, tenant, tenantIndex);
            upsertPaymentForInvoice(subscriptionInvoice, tenant, tenantIndex);

            seedProductsForTenant(tenant, tenantIndex);
            List<Customer> customers = seedCustomersForTenant(tenant, tenantIndex);

            User tenantAdmin = upsertTenantRoleUser(tenant, "admin", Role.ADMIN);
            User tenantManager = upsertTenantRoleUser(tenant, "manager", Role.MANAGER);
            User tenantStaff = upsertTenantRoleUser(tenant, "staff", Role.STAFF);

            List<Company> tenantCompanies = new ArrayList<>();

            for (int companyOffset = 1; companyOffset <= companiesPerTenant; companyOffset++) {
                int globalCompanyIndex = ((tenantIndex - 1) * companiesPerTenant) + companyOffset;

                Company company = upsertDemoCompany(
                        tenant,
                        globalCompanyIndex,
                        companyOffset
                );

                tenantCompanies.add(company);
                upsertInvoiceSequence(tenant.getTenantId(), company.getId(), financialYear);
            }

            for (Company company : tenantCompanies) {
                upsertAccess(tenantAdmin.getId(), company.getId(), tenant.getTenantId(), Role.ADMIN);
                upsertAccess(tenantManager.getId(), company.getId(), tenant.getTenantId(), Role.MANAGER);
                upsertAccess(tenantStaff.getId(), company.getId(), tenant.getTenantId(), Role.STAFF);
            }

            for (int companyOffset = 1; companyOffset <= tenantCompanies.size(); companyOffset++) {
                Company company = tenantCompanies.get(companyOffset - 1);
                int globalCompanyIndex = ((tenantIndex - 1) * companiesPerTenant) + companyOffset;

                seedInvoicesForCompany(
                        tenant,
                        company,
                        customers,
                        globalCompanyIndex
                );
            }
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
        user.setActive(true);

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

    private User upsertTenantRoleUser(Tenant tenant, String suffix, Role role) {
        String username = "tenant" + tenant.getTenantId() + "_" + suffix;
        String email = username + "@local.com";

        User user = userRepo.findByUsername(username).orElseGet(User::new);

        user.setUsername(username);
        user.setEmail(email);

        if (user.getId() == null) {
            user.setPassword(encoder.encode("admin@1234"));
        }

        user.setScope(UserScope.TENANT);
        user.setTenantId(tenant.getTenantId());
        user.setRoles(List.of(role.name()));
        user.setActive(true);

        return userRepo.save(user);
    }

    private Company upsertDemoCompany(Tenant tenant, int globalCompanyIndex, int companyOffsetForTenant) {
        String gstin = generateCompanyGstin(globalCompanyIndex);
        String name = resolveCompanyName(globalCompanyIndex);
        String email = "company" + globalCompanyIndex + "@demo.com";

        Company company = companyRepo.findByGstin(gstin).orElseGet(Company::new);

        company.setTenantId(tenant.getTenantId());
        company.setName(name);
        company.setLegalName(name + " Private Limited");
        company.setTradeName(name);
        company.setGstin(gstin);
        company.setEmail(email);
        company.setActive(true);
        company.setType(resolveCompanyType(globalCompanyIndex));
        company.setPhone("98" + String.format("%08d", globalCompanyIndex));
        company.setAddressLine1("Building " + companyOffsetForTenant + ", Business Park");
        company.setAddressLine2("Sector " + ((globalCompanyIndex % 7) + 1));
        company.setCity(resolveCity(globalCompanyIndex));
        company.setState(resolveState(gstin));
        company.setCountry("India");

        if (gstin != null && gstin.length() >= 12) {
            company.setStateCode(gstin.substring(0, 2));
            company.setPan(gstin.substring(2, 12));
        }

        company.setPincode("560" + String.format("%03d", globalCompanyIndex));

        return companyRepo.save(company);
    }

    private List<Customer> seedCustomersForTenant(Tenant tenant, int tenantIndex) {
        List<Customer> customers = new ArrayList<>();

        for (int i = 1; i <= CUSTOMERS_PER_TENANT; i++) {
            int customerIndex = ((tenantIndex - 1) * CUSTOMERS_PER_TENANT) + i;
            customers.add(upsertDemoCustomer(tenant.getTenantId(), customerIndex, i));
        }

        return customers;
    }

    private Customer upsertDemoCustomer(Long tenantId, int globalCustomerIndex, int localCustomerIndex) {
        String code = "CUST-" + tenantId + "-" + String.format("%02d", localCustomerIndex);
        String gstin = generateCustomerGstin(globalCustomerIndex);

        Customer customer = customerRepository.findByTenantIdAndCodeIgnoreCase(tenantId, code)
                .orElseGet(Customer::new);

        customer.setTenantId(tenantId);
        customer.setCode(code);
        customer.setLegalName("Customer " + globalCustomerIndex + " Private Limited");
        customer.setTradeName("Customer " + globalCustomerIndex);
        customer.setCustomerType(CustomerType.BUSINESS);
        customer.setGstRegistrationType(GstRegistrationType.REGISTERED);
        customer.setGstin(gstin);
        customer.setPan(gstin.substring(2, 12));
        customer.setContactPerson("Finance Manager " + globalCustomerIndex);
        customer.setPhone("90" + String.format("%08d", globalCustomerIndex));
        customer.setEmail("customer" + globalCustomerIndex + "@mail.com");

        customer.setBillingAddressLine1("Plot " + globalCustomerIndex + ", Commercial Tech Park");
        customer.setBillingAddressLine2("Phase " + ((globalCustomerIndex % 4) + 1));
        customer.setBillingCity(resolveCustomerCity(globalCustomerIndex));
        customer.setBillingState(resolveState(gstin));
        customer.setBillingStateCode(gstin.substring(0, 2));
        customer.setBillingPincode("600" + String.format("%03d", globalCustomerIndex % 1000));
        customer.setBillingCountry("India");

        customer.setShippingSameAsBilling(true);
        customer.setShippingAddressLine1(customer.getBillingAddressLine1());
        customer.setShippingAddressLine2(customer.getBillingAddressLine2());
        customer.setShippingCity(customer.getBillingCity());
        customer.setShippingState(customer.getBillingState());
        customer.setShippingStateCode(customer.getBillingStateCode());
        customer.setShippingPincode(customer.getBillingPincode());
        customer.setShippingCountry(customer.getBillingCountry());

        customer.setPaymentTermsDays((globalCustomerIndex % 3 == 0) ? 15 : 30);
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

    private void seedProductsForTenant(Tenant tenant, int tenantIndex) {
        UnitMaster licenseUnit = getUnitByCode("LICENSE");
        UnitMaster userUnit = getUnitByCode("USER");
        UnitMaster monthUnit = getUnitByCode("MONTH");
        UnitMaster nosUnit = getUnitByCode("NOS");
        UnitMaster boxUnit = getUnitByCode("BOX");
        UnitMaster pcsUnit = getUnitByCode("PCS");
        UnitMaster yearUnit = getUnitByCode("YEAR");

        HsnSacMaster softwareDev = getHsnSacByCode("998314");
        HsnSacMaster itSupport = getHsnSacByCode("998313");
        HsnSacMaster hosting = getHsnSacByCode("998315");
        HsnSacMaster packagedSoftware = getHsnSacByCode("852349");
        HsnSacMaster officeFurniture = getHsnSacByCode("940360");
        HsnSacMaster stationery = getHsnSacByCode("441112");
        HsnSacMaster pantry = getHsnSacByCode("210690");
        HsnSacMaster education = getHsnSacByCode("490700");
        HsnSacMaster hardware = getHsnSacByCode("847130");

        upsertProduct(tenant.getTenantId(), "SOFT-LIC-" + tenantIndex + "-01", "GST Billing Pro License", "Primary GST billing software license", new BigDecimal("4999.00"), softwareDev, licenseUnit, softwareDev.getDefaultGstSlab(), true);
        upsertProduct(tenant.getTenantId(), "SUPPORT-" + tenantIndex + "-02", "Support Retainer", "Monthly support and operational assistance", new BigDecimal("1999.00"), itSupport, monthUnit, itSupport.getDefaultGstSlab(), true);
        upsertProduct(tenant.getTenantId(), "USERPACK-" + tenantIndex + "-03", "Additional User Pack", "Per-user add-on for billing team", new BigDecimal("299.00"), hosting, userUnit, hosting.getDefaultGstSlab(), true);
        upsertProduct(tenant.getTenantId(), "SETUPKIT-" + tenantIndex + "-04", "Implementation Starter Kit", "One-time onboarding and implementation kit", new BigDecimal("1499.00"), packagedSoftware, nosUnit, packagedSoftware.getDefaultGstSlab(), true);
        upsertProduct(tenant.getTenantId(), "CHAIRSET-" + tenantIndex + "-05", "Office Furniture Bundle", "Workstation furniture bundle", new BigDecimal("8999.00"), officeFurniture, boxUnit, officeFurniture.getDefaultGstSlab(), tenantIndex % 2 == 0);
        upsertProduct(tenant.getTenantId(), "STATKIT-" + tenantIndex + "-06", "Stationery Pack", "Paper and stationery consumables", new BigDecimal("799.00"), stationery, pcsUnit, stationery.getDefaultGstSlab(), true);
        upsertProduct(tenant.getTenantId(), "PANTRY-" + tenantIndex + "-07", "Pantry Supply Bundle", "Packaged pantry essentials", new BigDecimal("599.00"), pantry, boxUnit, pantry.getDefaultGstSlab(), true);
        upsertProduct(tenant.getTenantId(), "GUIDE-" + tenantIndex + "-08", "Compliance Handbook", "Printed compliance and GST handbook", new BigDecimal("249.00"), education, nosUnit, education.getDefaultGstSlab(), true);
        upsertProduct(tenant.getTenantId(), "DEVICE-" + tenantIndex + "-09", "Billing Workstation", "Portable workstation for billing operations", new BigDecimal("42999.00"), hardware, nosUnit, hardware.getDefaultGstSlab(), true);
        upsertProduct(tenant.getTenantId(), "AMC-" + tenantIndex + "-10", "Annual Maintenance Contract", "Yearly maintenance for deployed solution", new BigDecimal("12999.00"), itSupport, yearUnit, itSupport.getDefaultGstSlab(), true);
    }

    private void upsertInvoiceSequence(Long tenantId, Long companyId, String financialYear) {
        upsertInvoiceSequenceForDocumentType(
                tenantId,
                companyId,
                financialYear,
                DocumentType.TAX_INVOICE,
                "INV/" + financialYear + "/"
        );

        upsertInvoiceSequenceForDocumentType(
                tenantId,
                companyId,
                financialYear,
                DocumentType.PROFORMA_INVOICE,
                "PI/" + financialYear + "/"
        );

        upsertInvoiceSequenceForDocumentType(
                tenantId,
                companyId,
                financialYear,
                DocumentType.CREDIT_NOTE,
                "CN/" + financialYear + "/"
        );

        upsertInvoiceSequenceForDocumentType(
                tenantId,
                companyId,
                financialYear,
                DocumentType.DEBIT_NOTE,
                "DN/" + financialYear + "/"
        );
    }

    private void upsertInvoiceSequenceForDocumentType(
            Long tenantId,
            Long companyId,
            String financialYear,
            DocumentType documentType,
            String prefix
    ) {
        InvoiceSequence existing = invoiceSequenceRepository
                .findByTenantIdAndCompanyIdAndDocumentTypeAndFinancialYear(
                        tenantId,
                        companyId,
                        documentType,
                        financialYear
                )
                .orElseGet(InvoiceSequence::new);

        existing.setTenantId(tenantId);
        existing.setCompanyId(companyId);
        existing.setDocumentType(documentType);
        existing.setFinancialYear(financialYear);
        existing.setPrefix(prefix);
        existing.setSuffix(null);
        existing.setPaddingLength(5);
        existing.setResetPolicy(SequenceResetPolicy.FINANCIAL_YEAR);
        existing.setActive(true);

        if (existing.getId() == null) {
            existing.setCurrentNumber(0L);
        }

        invoiceSequenceRepository.save(existing);
    }

    private void seedInvoicesForCompany(
            Tenant tenant,
            Company company,
            List<Customer> customers,
            int globalCompanyIndex
    ) {
        List<Product> products = productRepository.findByTenantId(tenant.getTenantId());
        if (products.size() < 2) {
            return;
        }

        List<InvoiceDto> seededTaxInvoices = new ArrayList<>();

        for (int invoiceOffset = 1; invoiceOffset <= INVOICES_PER_COMPANY; invoiceOffset++) {
            Customer customer = customers.get((invoiceOffset - 1) % customers.size());

            InvoiceDto taxInvoice = seedSingleInvoice(
                    tenant.getTenantId(),
                    company,
                    customer,
                    products,
                    invoiceOffset,
                    globalCompanyIndex,
                    DocumentType.TAX_INVOICE,
                    null
            );

            if (taxInvoice != null) {
                seededTaxInvoices.add(taxInvoice);
            }

            seedSingleInvoice(
                    tenant.getTenantId(),
                    company,
                    customer,
                    products,
                    invoiceOffset,
                    globalCompanyIndex,
                    DocumentType.PROFORMA_INVOICE,
                    null
            );
        }

        for (int i = 0; i < seededTaxInvoices.size(); i++) {
            InvoiceDto referenceInvoice = seededTaxInvoices.get(i);
            int invoiceOffset = i + 1;

            Customer referenceCustomer = customers.stream()
                    .filter(c -> c.getId().equals(referenceInvoice.getCustomerId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("Customer not found for reference invoice"));

            seedSingleInvoice(
                    tenant.getTenantId(),
                    company,
                    referenceCustomer,
                    products,
                    invoiceOffset,
                    globalCompanyIndex,
                    DocumentType.CREDIT_NOTE,
                    referenceInvoice
            );

            seedSingleInvoice(
                    tenant.getTenantId(),
                    company,
                    referenceCustomer,
                    products,
                    invoiceOffset,
                    globalCompanyIndex,
                    DocumentType.DEBIT_NOTE,
                    referenceInvoice
            );
        }
    }

    private InvoiceDto seedSingleInvoice(
            Long tenantId,
            Company company,
            Customer customer,
            List<Product> products,
            int invoiceOffset,
            int globalCompanyIndex,
            DocumentType documentType,
            InvoiceDto referenceInvoice
    ) {
        int seedDiscriminator = switch (documentType) {
            case TAX_INVOICE -> 0;
            case PROFORMA_INVOICE -> 1000;
            case CREDIT_NOTE -> 2000;
            case DEBIT_NOTE -> 3000;
        };

        int invoiceSeed = (globalCompanyIndex * 100) + invoiceOffset + seedDiscriminator;

        Product firstProduct = products.get((invoiceOffset - 1) % products.size());
        Product secondProduct = products.get(invoiceOffset % products.size());

        CreateInvoiceRequest request = new CreateInvoiceRequest();
        request.setCustomerId(customer.getId());
        request.setDocumentType(documentType);
        request.setReferenceInvoiceId(referenceInvoice != null ? referenceInvoice.getId() : null);
        request.setInvoiceDate(LocalDate.now().minusDays(invoiceSeed % 25));
        request.setNotes("Demo " + resolveDocumentLabel(documentType).toLowerCase() + " generated by seed data");
        request.setTermsAndConditions("Payment due within agreed credit period.");

        CreateInvoiceLineRequest line1 = new CreateInvoiceLineRequest();
        line1.setProductId(firstProduct.getId());
        line1.setDescription(firstProduct.getDescription());
        line1.setQuantity(new BigDecimal("1.000"));
        line1.setUnitPrice(firstProduct.getDefaultPrice());

        CreateInvoiceLineRequest line2 = new CreateInvoiceLineRequest();
        line2.setProductId(secondProduct.getId());
        line2.setDescription(secondProduct.getDescription());
        line2.setQuantity(BigDecimal.valueOf((invoiceOffset % 3) + 1L).setScale(3));
        line2.setUnitPrice(secondProduct.getDefaultPrice());

        request.setLines(List.of(line1, line2));

        try {
            return invoiceService.createForSeed(tenantId, company.getId(), request);
        } catch (IllegalArgumentException ex) {
            if (!isDuplicateInvoiceNumberError(ex)) {
                throw ex;
            }
            return null;
        }
    }

    private boolean isDuplicateInvoiceNumberError(IllegalArgumentException ex) {
        return ex.getMessage() != null && ex.getMessage().contains("Invoice");
    }

    private String resolveDocumentLabel(DocumentType documentType) {
        return switch (documentType) {
            case PROFORMA_INVOICE -> "Proforma Invoice";
            case TAX_INVOICE -> "Tax Invoice";
            case CREDIT_NOTE -> "Credit Note";
            case DEBIT_NOTE -> "Debit Note";
        };
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

    private String generateTenantAnchorGstin(int index) {
        String stateCode = String.format("%02d", 27 + (index % 5));
        String pan = String.format("TENNT%04dF", index);
        String entity = String.valueOf((index % 9) + 1);
        return stateCode + pan + entity + "Z5";
    }

    private String generateCompanyGstin(int index) {
        String[] stateCodes = {"27", "29", "33", "36", "32"};
        String stateCode = stateCodes[index % stateCodes.length];
        String pan = String.format("CMPNY%04dF", index);
        String entity = String.valueOf((index % 9) + 1);
        return stateCode + pan + entity + "Z5";
    }

    private String generateCustomerGstin(int index) {
        String[] stateCodes = {"27", "29", "33", "36", "32"};
        String stateCode = stateCodes[index % stateCodes.length];
        String pan = String.format("CUSTM%04dF", index);
        String entity = String.valueOf((index % 9) + 1);
        return stateCode + pan + entity + "Z5";
    }

    private String resolveCompanyName(int index) {
        return switch (index % 10) {
            case 0 -> "Apex Technologies " + index;
            case 1 -> "Bluewave Solutions " + index;
            case 2 -> "Crescent Systems " + index;
            case 3 -> "Delta Tradecorp " + index;
            case 4 -> "Evergreen Retail " + index;
            case 5 -> "Fusion Services " + index;
            case 6 -> "Granite Industries " + index;
            case 7 -> "Helix Consulting " + index;
            case 8 -> "Indus Mercantile " + index;
            default -> "Jupiter Innovations " + index;
        };
    }

    private CompanyType resolveCompanyType(int index) {
        return switch (index % 4) {
            case 0 -> CompanyType.PRIVATE_LIMITED;
            case 1 -> CompanyType.LLP;
            case 2 -> CompanyType.PARTNERSHIP;
            default -> CompanyType.PROPRIETORSHIP;
        };
    }

    private String resolveCity(int index) {
        return switch (index % 5) {
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
                    SubscriptionStatus.ACTIVE
            );
            case 2 -> new PlanSeed(
                    "BUSINESS",
                    "Business",
                    BillingCycle.MONTHLY,
                    new BigDecimal("7500.00"),
                    new BigDecimal("7500.00"),
                    new BigDecimal("90000.00"),
                    SubscriptionStatus.PAST_DUE
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