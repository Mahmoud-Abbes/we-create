package com.wecreate.api.shared.dtos.dashboard;

import java.time.LocalDateTime;
import java.util.UUID;

public record InvoiceResponse(
        UUID id,
        Long amount,
        String currency,
        String status,
        LocalDateTime paidAt,
        String hostedPdfUrl,
        String stripeInvoiceId
) {}
