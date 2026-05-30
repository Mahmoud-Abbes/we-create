package com.wecreate.api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String jsonContent = "";

    /** Site template rendered by site-engine (e.g. SHOWCASE, ECOMMERCE). */
    private String projectType;

    /** Billing plan chosen at checkout (e.g. SUBSCRIPTION, THREE_MONTHS, ONE_MONTH). */
    private String billingPlan;

    @Column(nullable = false)
    private String subStatus = "TRIAL";

    @Column(name = "is_deployable", nullable = false)
    private boolean deployable = true;

    private String stripeSubId;

    private LocalDateTime periodEndAt;

    // Transaction gatekeeper column
    @Column(name = "stripe_checkout_url", length = 2048)
    private String stripeCheckoutUrl;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime updatedAt;
}