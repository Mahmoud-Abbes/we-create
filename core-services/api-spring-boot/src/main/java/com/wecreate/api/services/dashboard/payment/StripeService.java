package com.wecreate.api.services.dashboard.payment;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.param.SubscriptionUpdateParams;
import com.stripe.param.checkout.SessionCreateParams;
import com.wecreate.api.models.Project;
import com.wecreate.api.repositories.dashboard.ProjectRepository;
import com.wecreate.api.services.dashboard.project.ProjectAccessService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class StripeService {

    private final ProjectRepository projectRepository;
    private final ProjectAccessService projectAccessService;

    public StripeService(
            ProjectRepository projectRepository,
            ProjectAccessService projectAccessService
    ) {
        this.projectRepository = projectRepository;
        this.projectAccessService = projectAccessService;
    }

    @Transactional
    public String createCheckoutSession(UUID userId, UUID projectId, String planType) throws StripeException {
        projectAccessService.requireOwnerOfProject(userId, projectId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with ID: " + projectId));

        // 1. GATEKEEPER CHECK: If the URL is present, return it to block duplicate payments
        if (project.getStripeCheckoutUrl() != null) {
            return project.getStripeCheckoutUrl();
        }

        String successUrl = "http://localhost/view/" + project.getSlug() + "?payment=success";
        String cancelUrl = "http://localhost/view/" + project.getSlug() + "?payment=cancel";

        Map<String, String> metadata = new HashMap<>();
        metadata.put("projectId", projectId.toString());
        metadata.put("planType", planType);

        // 2. EXPLICIT THREE-WAY MATRIX SWITCH
        long unitAmountInCents;
        SessionCreateParams.Mode sessionMode;

        switch (planType) {
            case "THREE_MONTHS" -> {
                unitAmountInCents = 2000; // $20.00 flat total bundle
                sessionMode = SessionCreateParams.Mode.PAYMENT;
            }
            case "SUBSCRIPTION" -> {
                unitAmountInCents = 500; // $5.00 recurring monthly
                sessionMode = SessionCreateParams.Mode.SUBSCRIPTION;
            }
            default -> { // Handles "ONE_MONTH" fallback baseline
                unitAmountInCents = 1000; // $10.00 flat one-time
                sessionMode = SessionCreateParams.Mode.PAYMENT;
            }
        }

        // 3. Build Line Item Product Data
        SessionCreateParams.LineItem.PriceData.Builder priceDataBuilder = SessionCreateParams.LineItem.PriceData.builder()
                .setCurrency("usd")
                .setUnitAmount(unitAmountInCents)
                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                        .setName("WeCreate Plan: " + planType)
                        .build());

        // Attach repeating interval rule if billing track is recurring subscription mode
        if (sessionMode == SessionCreateParams.Mode.SUBSCRIPTION) {
            priceDataBuilder.setRecurring(
                    SessionCreateParams.LineItem.PriceData.Recurring.builder()
                            .setInterval(SessionCreateParams.LineItem.PriceData.Recurring.Interval.MONTH)
                            .build()
            );
        }

        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .putAllMetadata(metadata)
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(priceDataBuilder.build())
                        .build())
                .setMode(sessionMode);

        // invoice_creation is only valid for one-time payment mode (not subscriptions)
        if (sessionMode == SessionCreateParams.Mode.PAYMENT) {
            paramsBuilder.setInvoiceCreation(
                    SessionCreateParams.InvoiceCreation.builder()
                            .setEnabled(true)
                            .build()
            );
        }

        SessionCreateParams params = paramsBuilder.build();

        try {
            // 4. Create Stripe Cloud Session Room
            Session session = Session.create(params);

            // 5. Lock the gate by persisting the live URL link
            project.setStripeCheckoutUrl(session.getUrl());
            projectRepository.save(project);

            return session.getUrl();
        } catch (StripeException e) {
            // Rollback column string to NULL if connection pipeline breaks down
            project.setStripeCheckoutUrl(null);
            projectRepository.save(project);
            throw e;
        }
    }

    @Transactional
    public void cancelSubscription(UUID userId, String slug) throws StripeException {
        Project project = projectAccessService.requireOwnerProject(userId, slug);

        if (!"SUBSCRIPTION".equals(project.getBillingPlan())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only recurring subscriptions can be canceled."
            );
        }

        String stripeSubId = project.getStripeSubId();
        if (stripeSubId == null || stripeSubId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No active Stripe subscription found for this project."
            );
        }

        Subscription subscription = Subscription.retrieve(stripeSubId);
        subscription.update(
                SubscriptionUpdateParams.builder()
                        .setCancelAtPeriodEnd(true)
                        .build()
        );

        project.setSubStatus("CANCELED");
        projectRepository.save(project);
    }

}