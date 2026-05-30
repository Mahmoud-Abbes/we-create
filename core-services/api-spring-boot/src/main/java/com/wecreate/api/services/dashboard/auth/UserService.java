package com.wecreate.api.services.dashboard.auth;

import com.wecreate.api.models.dashboard.User;
import com.wecreate.api.repositories.dashboard.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // Ensures that the operation is either handled fully or not handled at all.
    @Transactional
    public void syncUserWithIdP(Jwt jwt) {
        String keycloakId = jwt.getSubject();

        // If user doesn't exist in our DB, create them
        if (!userRepository.existsById(keycloakId)) {
            String preferredUsername = jwt.getClaimAsString("preferred_username");
            if (preferredUsername != null && preferredUsername.contains("@")) {
                preferredUsername = preferredUsername.substring(0, preferredUsername.indexOf("@"));
            }

            User newUser = User.builder()
                    .id(keycloakId)
                    .username(preferredUsername)
                    .email(jwt.getClaimAsString("email"))
                    .fullName(jwt.getClaimAsString("name")) // Standard OIDC claim for Full Name
                    .build();

            userRepository.save(newUser);
        }
    }
}