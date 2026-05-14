package com.wecreate.api.services.engine;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
public class TokenService {
    // Stores: TokenString -> (Slug, Expiry)
    private final ConcurrentHashMap<String, TokenMetadata> tokenVault = new ConcurrentHashMap<>();

    public String generateToken(String slug) {
        String token = UUID.randomUUID().toString();
        tokenVault.put(token, new TokenMetadata(slug, LocalDateTime.now().plusSeconds(60)));
        return token;
    }

    public boolean validateAndBurn(String token, String slug) {
        TokenMetadata metadata = tokenVault.get(token);
        if (metadata != null && metadata.slug.equals(slug) && metadata.expiry.isAfter(LocalDateTime.now())) {
            tokenVault.remove(token); // BURN ON USE
            return true;
        }
        return false;
    }

    private record TokenMetadata(String slug, LocalDateTime expiry) {}
}