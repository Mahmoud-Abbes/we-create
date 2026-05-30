package com.wecreate.api.shared.dtos.dashboard;

import java.time.LocalDateTime;
import java.util.List;

public record InvoicesAndDeploymentResponse(
        List<InvoiceResponse> invoices,
        boolean deployable,
        String subscriptionStatus,
        String billingPlan,
        LocalDateTime periodEndAt,
        String projectSlug
) {}
