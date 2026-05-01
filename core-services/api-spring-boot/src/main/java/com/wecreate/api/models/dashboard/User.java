package com.wecreate.api.models.dashboard;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder // Allow you to do User.builder().username("username").build()
public class User {
    @Id
    private String id; // The UUID from Keycloak

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    // This will store the combined firstName + lastName from Keycloak
    private String fullName;

    private String stripeCustomerId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
