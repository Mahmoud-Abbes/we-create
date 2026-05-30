package com.wecreate.api.controllers.dashboard.payment;

import com.wecreate.api.services.dashboard.payment.StripeWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final StripeWebhookService stripeWebhookService;

    @PostMapping("/webhook")
    public ResponseEntity<String> receiveWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        try {
            stripeWebhookService.handleWebhook(payload, sigHeader);
            return ResponseEntity.ok("Success");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Signature failure");
        } catch (Exception e) {
            log.error("Stripe webhook processing failed", e);
            return ResponseEntity.internalServerError().body("Processing failure");
        }
    }
}