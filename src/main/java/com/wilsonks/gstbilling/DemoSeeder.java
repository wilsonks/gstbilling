package com.wilsonks.gstbilling;

import com.wilsonks.gstbilling.auth.access.UserAccess;
import com.wilsonks.gstbilling.auth.access.UserAccessRepository;
import com.wilsonks.gstbilling.auth.identity.Role;
import com.wilsonks.gstbilling.auth.identity.User;
import com.wilsonks.gstbilling.auth.identity.UserRepository;
import com.wilsonks.gstbilling.auth.identity.UserScope;
import com.wilsonks.gstbilling.company.Company;
import com.wilsonks.gstbilling.company.CompanyRepository;
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

    @Override
    public void run(ApplicationArguments args) {
        seedMasters();

        upsertPlatformUser(
                "root",
                "root@local.com",
                "root@1234",
                List.of("SUPER_ADMIN")
        );

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
            SubscriptionInvoice invoice = upsertLatestInvoice(subscription, tenant, i);
            upsertPaymentForInvoice(invoice, tenant, i);

            seedProductsForTenant(tenant, i);
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

    private User upsertPlatformUser(
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

        return userRepo.save(user);
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
        company.setGstin(gstin);
        company.setEmail(email);
        company.setTenantId(tenantId);
        company.setActive(true);

        if (gstin != null && gstin.length() >= 12) {
            company.setStateCode(gstin.substring(0, 2));
            company.setPan(gstin.substring(2, 12));
        }

        return companyRepo.save(company);
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

    private Product upsertProduct(
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

        return productRepository.save(product);
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

    private UnitMaster upsertUnit(String code, String name, String symbol) {
        UnitMaster unit = unitMasterRepository.findByCodeIgnoreCase(code)
                .orElseGet(UnitMaster::new);

        unit.setCode(code);
        unit.setName(name);
        unit.setSymbol(symbol);
        unit.setActive(true);

        return unitMasterRepository.save(unit);
    }

    private HsnSacMaster upsertHsnSac(
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

        return hsnSacMasterRepository.save(hsnSac);
    }

    private UnitMaster getUnitByCode(String code) {
        return unitMasterRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new IllegalStateException("Unit not found: " + code));
    }

    private HsnSacMaster getHsnSacByCode(String code) {
        return hsnSacMasterRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new IllegalStateException("HSN/SAC not found: " + code));
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