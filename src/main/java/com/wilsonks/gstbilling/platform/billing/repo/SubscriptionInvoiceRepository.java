package com.wilsonks.gstbilling.platform.billing.repo;

import com.wilsonks.gstbilling.platform.billing.entity.SubscriptionInvoice;
import com.wilsonks.gstbilling.platform.billing.model.SubscriptionInvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SubscriptionInvoiceRepository extends JpaRepository<SubscriptionInvoice, Long> {

    Optional<SubscriptionInvoice> findByInvoiceNo(String invoiceNo);

    List<SubscriptionInvoice> findByTenantId(Long tenantId);

    List<SubscriptionInvoice> findBySubscriptionId(Long subscriptionId);

    List<SubscriptionInvoice> findTop10ByOrderByIssuedOnDescIdDesc();

    List<SubscriptionInvoice> findByIssuedOnBetween(LocalDate from, LocalDate to);

    List<SubscriptionInvoice> findByStatus(SubscriptionInvoiceStatus status);

    List<SubscriptionInvoice> findByStatusIn(Collection<SubscriptionInvoiceStatus> statuses);

    List<SubscriptionInvoice> findByTenantIdOrderByIssuedOnDesc(Long tenantId);

    Optional<SubscriptionInvoice> findTopByTenantIdOrderByIssuedOnDescIdDesc(Long tenantId);

    long countByStatus(SubscriptionInvoiceStatus status);
}