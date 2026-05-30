package com.wecreate.api.repositories.dashboard;

import com.wecreate.api.models.dashboard.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    boolean existsByStripeInvoiceId(String stripeInvoiceId);

    Optional<Invoice> findByStripeInvoiceId(String stripeInvoiceId);

    List<Invoice> findByUserIdOrderByPaidAtDesc(UUID userId);

    List<Invoice> findByUserIdAndProject_SlugOrderByPaidAtDesc(UUID userId, String slug);
}