package com.wilsonks.gstbilling.platform.billing.repo;

import com.wilsonks.gstbilling.platform.billing.entity.SubscriptionPayment;
import com.wilsonks.gstbilling.platform.billing.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SubscriptionPaymentRepository extends JpaRepository<SubscriptionPayment, Long> {

    List<SubscriptionPayment> findByTenantId(Long tenantId);

    List<SubscriptionPayment> findByInvoiceId(Long invoiceId);

    List<SubscriptionPayment> findByPaymentDateBetween(LocalDate from, LocalDate to);

    List<SubscriptionPayment> findByStatus(PaymentStatus status);

    List<SubscriptionPayment> findByTenantIdOrderByPaymentDateDesc(Long tenantId);

    long countByStatus(PaymentStatus status);
}