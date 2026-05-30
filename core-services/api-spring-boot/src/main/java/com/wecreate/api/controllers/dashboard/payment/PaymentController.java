package com.wecreate.api.controllers.dashboard.payment;

import com.stripe.exception.StripeException;
import com.wecreate.api.services.dashboard.payment.InvoiceService;
import com.wecreate.api.services.dashboard.payment.StripeService;
import com.wecreate.api.shared.dtos.dashboard.InvoiceResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final StripeService stripeService;
    private final InvoiceService invoiceService;

    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceResponse>> listInvoices(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(invoiceService.listForUser(UUID.fromString(jwt.getSubject())));
    }

    @PostMapping("/{slug}/cancel-subscription")
    public ResponseEntity<Void> cancelSubscription(
            @PathVariable String slug,
            @AuthenticationPrincipal Jwt jwt
    ) {
        try {
            stripeService.cancelSubscription(UUID.fromString(jwt.getSubject()), slug);
            return ResponseEntity.noContent().build();
        } catch (StripeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createCheckout(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CheckoutRequest request
    ) {
        try {
            UUID userId = UUID.fromString(jwt.getSubject());
            UUID targetId = UUID.fromString(request.getProjectId());

            String checkoutUrl = stripeService.createCheckoutSession(userId, targetId, request.getPlanType());

            Map<String, String> response = new HashMap<>();
            response.put("url", checkoutUrl);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "The layout format of the Project UUID is invalid.");
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (StripeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @Data
    public static class CheckoutRequest {
        private String projectId;
        private String planType;
    }
}