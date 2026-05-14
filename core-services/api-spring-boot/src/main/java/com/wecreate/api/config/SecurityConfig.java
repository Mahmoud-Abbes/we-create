package com.wecreate.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Chain 1 (highest priority): Handles /public/** endpoints.
     * NO JWT filter is installed here at all, so there is no Bearer challenge.
     * The site-engine can call these freely without any Authorization header.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**", "/api/public/**", "/error").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(withDefaults()));

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        // Use the internal Docker network URL to fetch Keycloak's public keys (JWKS)
        return NimbusJwtDecoder.withJwkSetUri("http://keycloak:8080/auth/realms/we-create/protocol/openid-connect/certs").build();
    }
}