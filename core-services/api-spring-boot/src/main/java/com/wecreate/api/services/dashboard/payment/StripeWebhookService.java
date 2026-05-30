package com.wecreate.api.services.dashboard.payment;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.wecreate.api.models.Project;
import com.wecreate.api.models.dashboard.Invoice;
import com.wecreate.api.repositories.dashboard.InvoiceRepository;
import com.wecreate.api.repositories.dashboard.ProjectRepository;
import com.wecreate.api.repositories.dashboard.UserProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripeWebhookService {

    private final ProjectRepository projectRepository;
    private final UserProjectRepository userProjectRepository;
    private final InvoiceRepository invoiceRepository;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Cryptographic signature verification failed", e);
            throw new IllegalArgumentException("Invalid signature");
        }

        log.info("Stripe webhook received: eventId={}, type={}", event.getId(), event.getType());

        switch (event.getType()) {
            case "checkout.session.completed" -> {
                Session session = deserializeCheckoutSession(event);
                if (session == null) {
                    throw new IllegalStateException("Failed to deserialize checkout session");
                }
                processSuccessfulCheckout(session);
            }
            case "invoice.finalized", "invoice.paid" -> {
                com.stripe.model.Invoice stripeInvoice = deserializeStripeInvoice(event);
                if (stripeInvoice != null) {
                    backfillHostedPdfUrl(stripeInvoice);
                }
            }
            default -> log.debug("Ignoring unhandled Stripe event type {}", event.getType());
        }
    }

    private Session deserializeCheckoutSession(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();

        if (deserializer.getObject().isPresent()) {
            return (Session) deserializer.getObject().get();
        }

        log.warn("Stripe API version mismatch for event {}. Using unsafe deserialization.", event.getId());
        try {
            return (Session) deserializer.deserializeUnsafe();
        } catch (com.stripe.exception.EventDataObjectDeserializationException e) {
            log.error("Failed to deserialize checkout session", e);
            return null;
        }
    }

    private com.stripe.model.Invoice deserializeStripeInvoice(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();

        if (deserializer.getObject().isPresent()) {
            return (com.stripe.model.Invoice) deserializer.getObject().get();
        }

        log.warn("Stripe API version mismatch for event {}. Using unsafe deserialization.", event.getId());
        try {
            return (com.stripe.model.Invoice) deserializer.deserializeUnsafe();
        } catch (com.stripe.exception.EventDataObjectDeserializationException e) {
            log.error("Failed to deserialize Stripe invoice", e);
            return null;
        }
    }

    private void processSuccessfulCheckout(Session session) {
        if (session.getMetadata() == null) {
            log.warn("Checkout session {} missing metadata. Skipping.", session.getId());
            return;
        }

        String projectIdStr = session.getMetadata().get("projectId");
        String planType = session.getMetadata().get("planType");

        if (projectIdStr == null || planType == null) {
            log.warn(
                    "Checkout session {} missing metadata (projectId={}, planType={}). Skipping.",
                    session.getId(),
                    projectIdStr,
                    planType
            );
            return;
        }

        UUID projectId = UUID.fromString(projectIdStr);
        log.info("Activating project {} with plan {}", projectId, planType);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalStateException("Project not found: " + projectId));

        UUID ownerUserId = userProjectRepository
                .findFirstByProject_IdAndRole(projectId, "OWNER")
                .map(link -> link.getUserId())
                .orElseThrow(() -> new IllegalStateException("Owner link missing for project: " + projectId));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime baseTime = project.getPeriodEndAt() != null && project.getPeriodEndAt().isAfter(now)
                ? project.getPeriodEndAt()
                : now;

        LocalDateTime calculatedExpiry = switch (planType) {
            case "THREE_MONTHS" -> baseTime.plusMonths(3);
            case "SUBSCRIPTION" -> baseTime.plusMonths(1);
            default -> baseTime.plusMonths(1);
        };

        if ("SUBSCRIPTION".equals(planType) && session.getSubscription() != null) {
            project.setStripeSubId(session.getSubscription());
        }

        project.setSubStatus("ACTIVE");
        project.setBillingPlan(planType);
        project.setPeriodEndAt(calculatedExpiry);
        project.setStripeCheckoutUrl(null);
        projectRepository.save(project);

        log.info(
                "Project {} activated via {}. Expires at {}",
                projectId,
                planType,
                calculatedExpiry
        );

        saveInvoiceRecord(session, project, ownerUserId);
    }

    private void saveInvoiceRecord(Session session, Project project, UUID ownerUserId) {
        String stripeInvoiceId = session.getInvoice();
        if (stripeInvoiceId == null || stripeInvoiceId.isBlank()) {
            log.warn(
                    "Checkout session {} has no Stripe invoice id; hosted PDF cannot be stored.",
                    session.getId()
            );
            return;
        }

        if (invoiceRepository.existsByStripeInvoiceId(stripeInvoiceId)) {
            backfillHostedPdfUrl(stripeInvoiceId);
            log.info("Invoice {} already recorded. Updated PDF URL if needed.", stripeInvoiceId);
            return;
        }

        Long amount = session.getAmountTotal() != null ? session.getAmountTotal() : 0L;
        String hostedPdfUrl = fetchHostedPdfUrl(stripeInvoiceId);

        Invoice invoice = new Invoice();
        invoice.setProject(project);
        invoice.setUserId(ownerUserId);
        invoice.setAmount(amount);
        invoice.setCurrency(session.getCurrency() != null ? session.getCurrency().toUpperCase() : "USD");
        invoice.setStripeInvoiceId(stripeInvoiceId);
        invoice.setHostedPdfUrl(hostedPdfUrl);
        invoice.setStatus("PAID");
        invoice.setPaidAt(LocalDateTime.now());

        invoiceRepository.save(invoice);
        log.info(
                "Invoice {} saved for user {} (pdf={})",
                stripeInvoiceId,
                ownerUserId,
                hostedPdfUrl != null
        );
    }

    private void backfillHostedPdfUrl(com.stripe.model.Invoice stripeInvoice) {
        if (stripeInvoice == null || stripeInvoice.getId() == null) {
            return;
        }

        String pdfUrl = stripeInvoice.getInvoicePdf();
        if (pdfUrl == null || pdfUrl.isBlank()) {
            backfillHostedPdfUrl(stripeInvoice.getId());
            return;
        }

        invoiceRepository.findByStripeInvoiceId(stripeInvoice.getId()).ifPresent(invoice -> {
            if (invoice.getHostedPdfUrl() == null || invoice.getHostedPdfUrl().isBlank()) {
                invoice.setHostedPdfUrl(pdfUrl);
                invoiceRepository.save(invoice);
                log.info("Hosted PDF URL saved for invoice {}", stripeInvoice.getId());
            }
        });
    }

    private void backfillHostedPdfUrl(String stripeInvoiceId) {
        invoiceRepository.findByStripeInvoiceId(stripeInvoiceId).ifPresent(invoice -> {
            if (invoice.getHostedPdfUrl() != null && !invoice.getHostedPdfUrl().isBlank()) {
                return;
            }
            String pdfUrl = fetchHostedPdfUrl(stripeInvoiceId);
            if (pdfUrl != null && !pdfUrl.isBlank()) {
                invoice.setHostedPdfUrl(pdfUrl);
                invoiceRepository.save(invoice);
                log.info("Hosted PDF URL backfilled for invoice {}", stripeInvoiceId);
            }
        });
    }

    private String fetchHostedPdfUrl(String stripeInvoiceId) {
        try {
            com.stripe.model.Invoice stripeInvoice = com.stripe.model.Invoice.retrieve(stripeInvoiceId);
            return stripeInvoice.getInvoicePdf();
        } catch (StripeException e) {
            log.warn("Could not fetch hosted PDF for Stripe invoice {}: {}", stripeInvoiceId, e.getMessage());
            return null;
        }
    }
}
