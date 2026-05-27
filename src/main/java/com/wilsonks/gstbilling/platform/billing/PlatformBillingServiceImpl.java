package com.wilsonks.gstbilling.platform.billing;

import com.wilsonks.gstbilling.auth.identity.User;
import com.wilsonks.gstbilling.auth.identity.UserRepository;
import com.wilsonks.gstbilling.company.Company;
import com.wilsonks.gstbilling.company.CompanyRepository;
import com.wilsonks.gstbilling.platform.billing.dto.BillingPlanSummaryDto;
import com.wilsonks.gstbilling.platform.billing.dto.BillingSummaryDto;
import com.wilsonks.gstbilling.platform.billing.dto.PlatformBillingOverviewDto;
import com.wilsonks.gstbilling.platform.billing.dto.RecentSubscriptionInvoiceDto;
import com.wilsonks.gstbilling.platform.billing.dto.RenewalWatchTenantDto;
import com.wilsonks.gstbilling.platform.billing.dto.TenantBillingRowDto;
import com.wilsonks.gstbilling.platform.billing.entity.SubscriptionInvoice;
import com.wilsonks.gstbilling.platform.billing.entity.SubscriptionPayment;
import com.wilsonks.gstbilling.platform.billing.entity.TenantSubscription;
import com.wilsonks.gstbilling.platform.billing.model.PaymentStatus;
import com.wilsonks.gstbilling.platform.billing.model.SubscriptionInvoiceStatus;
import com.wilsonks.gstbilling.platform.billing.model.SubscriptionStatus;
import com.wilsonks.gstbilling.platform.billing.repo.SubscriptionInvoiceRepository;
import com.wilsonks.gstbilling.platform.billing.repo.SubscriptionPaymentRepository;
import com.wilsonks.gstbilling.platform.billing.repo.TenantSubscriptionRepository;
import com.wilsonks.gstbilling.platform.tenant.Tenant;
import com.wilsonks.gstbilling.platform.tenant.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlatformBillingServiceImpl implements PlatformBillingService {

    private final TenantSubscriptionRepository tenantSubscriptionRepository;
    private final SubscriptionInvoiceRepository subscriptionInvoiceRepository;
    private final SubscriptionPaymentRepository subscriptionPaymentRepository;

    private final TenantRepository tenantRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Override
    public PlatformBillingOverviewDto getOverview(String period) {
        DateRange dateRange = resolveDateRange(period);

        List<Tenant> tenants = tenantRepository.findAll();
        List<TenantSubscription> subscriptions = tenantSubscriptionRepository.findAll();
        List<TenantSubscription> activeSubscriptions = subscriptions.stream()
                .filter(TenantSubscription::isActive)
                .toList();

        List<SubscriptionInvoice> invoicesInPeriod =
                subscriptionInvoiceRepository.findByIssuedOnBetween(dateRange.from(), dateRange.to());

        List<SubscriptionPayment> paymentsInPeriod =
                subscriptionPaymentRepository.findByPaymentDateBetween(dateRange.from(), dateRange.to());

        List<SubscriptionInvoice> recentInvoices =
                subscriptionInvoiceRepository.findTop10ByOrderByIssuedOnDescIdDesc();

        Map<Long, Tenant> tenantById = tenants.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(Tenant::getTenantId, t -> t));

        Map<Long, Long> companyCountByTenantId = buildCompanyCountByTenantId();
        Map<Long, Long> userCountByTenantId = buildUserCountByTenantId();
        Map<Long, SubscriptionInvoice> latestInvoiceByTenantId = buildLatestInvoiceByTenantId(tenants);

        BillingSummaryDto summary = buildSummary(
                tenants,
                subscriptions,
                activeSubscriptions,
                invoicesInPeriod,
                paymentsInPeriod
        );

        List<BillingPlanSummaryDto> plans = buildPlans(activeSubscriptions);

        List<RecentSubscriptionInvoiceDto> recentInvoiceDtos = recentInvoices.stream()
                .map(invoice -> toRecentInvoiceDto(invoice, tenantById.get(invoice.getTenantId())))
                .toList();

        List<TenantBillingRowDto> tenantRows = subscriptions.stream()
                .map(subscription -> toTenantBillingRowDto(
                        subscription,
                        tenantById.get(subscription.getTenantId()),
                        latestInvoiceByTenantId.get(subscription.getTenantId()),
                        companyCountByTenantId.getOrDefault(subscription.getTenantId(), 0L),
                        userCountByTenantId.getOrDefault(subscription.getTenantId(), 0L)
                ))
                .sorted(Comparator.comparing(TenantBillingRowDto::getTenantId).reversed())
                .toList();

        List<RenewalWatchTenantDto> renewalWatchlist = buildRenewalWatchlist(
                subscriptions,
                latestInvoiceByTenantId,
                tenantById
        );

        return PlatformBillingOverviewDto.builder()
                .summary(summary)
                .plans(plans)
                .recentInvoices(recentInvoiceDtos)
                .tenants(tenantRows)
                .renewalWatchlist(renewalWatchlist)
                .build();
    }

    private BillingSummaryDto buildSummary(
            List<Tenant> tenants,
            List<TenantSubscription> subscriptions,
            List<TenantSubscription> activeSubscriptions,
            List<SubscriptionInvoice> invoicesInPeriod,
            List<SubscriptionPayment> paymentsInPeriod
    ) {
        long totalTenants = tenants.size();

        long activeSubscriptionCount = activeSubscriptions.size();

        long suspendedTenants = subscriptions.stream()
                .filter(subscription -> subscription.getSubscriptionStatus() == SubscriptionStatus.SUSPENDED)
                .count();

        long overdueTenants = subscriptions.stream()
                .filter(this::isOverdueLikeSubscription)
                .count();

        BigDecimal mrr = activeSubscriptions.stream()
                .map(TenantSubscription::getMrr)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal arr = activeSubscriptions.stream()
                .map(TenantSubscription::getArr)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal billedThisPeriod = invoicesInPeriod.stream()
                .filter(invoice -> invoice.getStatus() != SubscriptionInvoiceStatus.VOID)
                .map(SubscriptionInvoice::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal collectedThisPeriod = paymentsInPeriod.stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.PAID)
                .map(SubscriptionPayment::getAmountPaid)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal outstandingAmount = subscriptions.stream()
                .map(this::computeOutstandingForSubscription)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal gstCollectedThisPeriod = invoicesInPeriod.stream()
                .filter(invoice -> invoice.getStatus() != SubscriptionInvoiceStatus.VOID)
                .map(SubscriptionInvoice::getGstAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return BillingSummaryDto.builder()
                .totalTenants(totalTenants)
                .activeSubscriptions(activeSubscriptionCount)
                .overdueTenants(overdueTenants)
                .suspendedTenants(suspendedTenants)
                .mrr(mrr)
                .arr(arr)
                .billedThisMonth(billedThisPeriod)
                .collectedThisMonth(collectedThisPeriod)
                .outstandingAmount(outstandingAmount)
                .gstCollectedThisMonth(gstCollectedThisPeriod)
                .build();
    }

    private List<BillingPlanSummaryDto> buildPlans(List<TenantSubscription> activeSubscriptions) {
        return activeSubscriptions.stream()
                .collect(Collectors.groupingBy(TenantSubscription::getPlanName))
                .entrySet()
                .stream()
                .map(entry -> BillingPlanSummaryDto.builder()
                        .name(entry.getKey())
                        .tenants(entry.getValue().size())
                        .mrr(entry.getValue().stream()
                                .map(TenantSubscription::getMrr)
                                .filter(Objects::nonNull)
                                .reduce(BigDecimal.ZERO, BigDecimal::add))
                        .build())
                .sorted(Comparator.comparing(BillingPlanSummaryDto::getMrr).reversed())
                .toList();
    }

    private List<RenewalWatchTenantDto> buildRenewalWatchlist(
            List<TenantSubscription> subscriptions,
            Map<Long, SubscriptionInvoice> latestInvoiceByTenantId,
            Map<Long, Tenant> tenantById
    ) {
        LocalDate today = LocalDate.now();
        LocalDate nextSevenDays = today.plusDays(7);

        return subscriptions.stream()
                .filter(subscription -> {
                    SubscriptionInvoice latestInvoice = latestInvoiceByTenantId.get(subscription.getTenantId());

                    boolean nearRenewal = subscription.getNextRenewalDate() != null
                            && !subscription.getNextRenewalDate().isAfter(nextSevenDays);

                    boolean overdueInvoice = latestInvoice != null
                            && latestInvoice.getStatus() == SubscriptionInvoiceStatus.OVERDUE;

                    boolean badSubscriptionState = subscription.getSubscriptionStatus() == SubscriptionStatus.PAST_DUE
                            || subscription.getSubscriptionStatus() == SubscriptionStatus.SUSPENDED;

                    return nearRenewal || overdueInvoice || badSubscriptionState;
                })
                .map(subscription -> {
                    Tenant tenant = tenantById.get(subscription.getTenantId());
                    SubscriptionInvoice latestInvoice = latestInvoiceByTenantId.get(subscription.getTenantId());

                    return RenewalWatchTenantDto.builder()
                            .tenantId(subscription.getTenantId())
                            .tenantName(tenant != null ? tenant.getName() : "Tenant #" + subscription.getTenantId())
                            .subscriptionStatus(enumName(subscription.getSubscriptionStatus()))
                            .paymentStatus(resolvePaymentStatus(subscription, latestInvoice))
                            .nextRenewalDate(subscription.getNextRenewalDate())
                            .outstanding(computeOutstandingForSubscription(subscription))
                            .build();
                })
                .sorted(Comparator.comparing(
                        RenewalWatchTenantDto::getNextRenewalDate,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();
    }

    private RecentSubscriptionInvoiceDto toRecentInvoiceDto(SubscriptionInvoice invoice, Tenant tenant) {
        return RecentSubscriptionInvoiceDto.builder()
                .invoiceNo(invoice.getInvoiceNo())
                .tenantId(invoice.getTenantId())
                .tenantName(tenant != null ? tenant.getName() : "Tenant #" + invoice.getTenantId())
                .amount(invoice.getTotalAmount())
                .gstAmount(invoice.getGstAmount())
                .issuedOn(invoice.getIssuedOn())
                .dueOn(invoice.getDueOn())
                .status(enumName(invoice.getStatus()))
                .build();
    }

    private TenantBillingRowDto toTenantBillingRowDto(
            TenantSubscription subscription,
            Tenant tenant,
            SubscriptionInvoice latestInvoice,
            long companies,
            long users
    ) {
        return TenantBillingRowDto.builder()
                .tenantId(subscription.getTenantId())
                .tenantName(tenant != null ? tenant.getName() : "Tenant #" + subscription.getTenantId())
                .gstin(tenant != null ? tenant.getGstin() : null)
                .contactEmail(tenant != null ? tenant.getContactEmail() : null)
                .plan(subscription.getPlanName())
                .billingCycle(enumName(subscription.getBillingCycle()))
                .subscriptionStatus(enumName(subscription.getSubscriptionStatus()))
                .paymentStatus(resolvePaymentStatus(subscription, latestInvoice))
                .mrr(defaultAmount(subscription.getMrr()))
                .arr(defaultAmount(subscription.getArr()))
                .billedThisCycle(latestInvoice != null ? defaultAmount(latestInvoice.getTotalAmount()) : BigDecimal.ZERO)
                .outstanding(computeOutstandingForSubscription(subscription))
                .gstRate(subscription.getGstRate())
                .companies(companies)
                .users(users)
                .lastPaymentDate(resolveLastPaymentDate(subscription.getTenantId()))
                .nextRenewalDate(subscription.getNextRenewalDate())
                .build();
    }

    private Map<Long, Long> buildCompanyCountByTenantId() {
        return companyRepository.findAll().stream()
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(Company::getTenantId, Collectors.counting()));
    }

    private Map<Long, Long> buildUserCountByTenantId() {
        return userRepository.findAll().stream()
                .filter(Objects::nonNull)
                .filter(user -> user.getTenantId() != null)
                .collect(Collectors.groupingBy(User::getTenantId, Collectors.counting()));
    }

    private Map<Long, SubscriptionInvoice> buildLatestInvoiceByTenantId(List<Tenant> tenants) {
        return tenants.stream()
                .map(Tenant::getTenantId)
                .distinct()
                .map(tenantId -> Map.entry(
                        tenantId,
                        subscriptionInvoiceRepository.findTopByTenantIdOrderByIssuedOnDescIdDesc(tenantId).orElse(null)
                ))
                .filter(entry -> entry.getValue() != null)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    private BigDecimal computeOutstandingForSubscription(TenantSubscription subscription) {
        Optional<SubscriptionInvoice> latestInvoiceOpt =
                subscriptionInvoiceRepository.findTopByTenantIdOrderByIssuedOnDescIdDesc(subscription.getTenantId());

        if (latestInvoiceOpt.isEmpty()) {
            return BigDecimal.ZERO;
        }

        SubscriptionInvoice latestInvoice = latestInvoiceOpt.get();

        if (latestInvoice.getStatus() == SubscriptionInvoiceStatus.PAID
                || latestInvoice.getStatus() == SubscriptionInvoiceStatus.VOID) {
            return BigDecimal.ZERO;
        }

        return defaultAmount(latestInvoice.getTotalAmount());
    }

    private String resolvePaymentStatus(TenantSubscription subscription, SubscriptionInvoice latestInvoice) {
        if (latestInvoice == null) {
            return subscription.getSubscriptionStatus() == SubscriptionStatus.TRIAL ? "TRIAL" : "PENDING";
        }

        return switch (latestInvoice.getStatus()) {
            case PAID -> "PAID";
            case OVERDUE -> "OVERDUE";
            case PENDING, ISSUED -> "PENDING";
            case DRAFT -> "DRAFT";
            case VOID -> "VOID";
        };
    }

    private LocalDate resolveLastPaymentDate(Long tenantId) {
        return subscriptionPaymentRepository.findByTenantIdOrderByPaymentDateDesc(tenantId).stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.PAID)
                .map(SubscriptionPayment::getPaymentDate)
                .findFirst()
                .orElse(null);
    }

    private boolean isOverdueLikeSubscription(TenantSubscription subscription) {
        if (subscription.getSubscriptionStatus() == SubscriptionStatus.PAST_DUE) {
            return true;
        }

        Optional<SubscriptionInvoice> latestInvoiceOpt =
                subscriptionInvoiceRepository.findTopByTenantIdOrderByIssuedOnDescIdDesc(subscription.getTenantId());

        return latestInvoiceOpt
                .map(invoice -> invoice.getStatus() == SubscriptionInvoiceStatus.OVERDUE)
                .orElse(false);
    }

    private BigDecimal defaultAmount(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private String enumName(Enum<?> value) {
        return value != null ? value.name() : null;
    }

    private DateRange resolveDateRange(String period) {
        LocalDate today = LocalDate.now();
        String normalized = period == null ? "this-month" : period.trim().toLowerCase();

        return switch (normalized) {
            case "today" -> new DateRange(today, today);
            case "this-week" -> new DateRange(today.minusDays(6), today);
            case "this-quarter" -> {
                int currentQuarter = ((today.getMonthValue() - 1) / 3);
                int startMonth = (currentQuarter * 3) + 1;
                LocalDate from = LocalDate.of(today.getYear(), startMonth, 1);
                yield new DateRange(from, today);
            }
            case "this-year" -> new DateRange(LocalDate.of(today.getYear(), 1, 1), today);
            default -> {
                YearMonth yearMonth = YearMonth.from(today);
                yield new DateRange(yearMonth.atDay(1), today);
            }
        };
    }

    private record DateRange(LocalDate from, LocalDate to) {
    }
}