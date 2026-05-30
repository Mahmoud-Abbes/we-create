package com.wecreate.api.models.dashboard;

import com.wecreate.api.models.Project;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    // Matches 'user_id' from your diagram to quickly query a client's billing profile
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // Matches 'amount' from your diagram (Stripe uses cents, e.g., 1000 = $10.00)
    @Column(name = "amount", nullable = false)
    private Long amount;

    // Matches 'currency' from your diagram (e.g., "usd")
    @Column(name = "currency", nullable = false, length = 10)
    private String currency;

    // Matches 'stripe_invoice_id' from your diagram (e.g., in_1NabcXYZ)
    @Column(name = "stripe_invoice_id", unique = true)
    private String stripeInvoiceId;

    // Matches 'hosted_pdf_url' from your diagram so users can download official invoices
    @Column(name = "hosted_pdf_url", length = 512)
    private String hostedPdfUrl;

    // Matches 'paid_at' from your diagram (Will be null if payment fails or is pending)
    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    // We can add the internal status and tracking defaults safely here
    @Column(nullable = false, length = 50)
    private String status; // "PAID", "OPEN", "FAILED"

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}