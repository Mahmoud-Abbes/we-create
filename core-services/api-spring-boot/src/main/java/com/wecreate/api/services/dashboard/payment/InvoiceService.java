package com.wecreate.api.services.dashboard.payment;

import com.wecreate.api.models.dashboard.Invoice;
import com.wecreate.api.repositories.dashboard.InvoiceRepository;
import com.wecreate.api.shared.dtos.dashboard.InvoiceResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    public List<InvoiceResponse> listForUser(UUID userId) {
        return invoiceRepository.findByUserIdOrderByPaidAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public InvoiceResponse toResponse(Invoice invoice) {
        return new InvoiceResponse(
                invoice.getId(),
                invoice.getAmount(),
                invoice.getCurrency(),
                invoice.getStatus(),
                invoice.getPaidAt(),
                invoice.getHostedPdfUrl(),
                invoice.getStripeInvoiceId()
        );
    }
}
