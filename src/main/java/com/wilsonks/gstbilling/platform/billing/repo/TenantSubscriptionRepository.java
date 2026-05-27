package com.wilsonks.gstbilling.platform.billing.repo;

import com.wilsonks.gstbilling.platform.billing.entity.TenantSubscription;
import com.wilsonks.gstbilling.platform.billing.model.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TenantSubscriptionRepository extends JpaRepository<TenantSubscription, Long> {

    Optional<TenantSubscription> findByTenantId(Long tenantId);

    List<TenantSubscription> findByActiveTrue();

    List<TenantSubscription> findBySubscriptionStatus(SubscriptionStatus status);

    long countByActiveTrue();

    long countBySubscriptionStatus(SubscriptionStatus status);

    List<TenantSubscription> findBySubscriptionStatusIn(Collection<SubscriptionStatus> statuses);

    List<TenantSubscription> findByNextRenewalDateLessThanEqual(LocalDate date);

    List<TenantSubscription> findByActiveTrueAndNextRenewalDateLessThanEqual(LocalDate date);
}