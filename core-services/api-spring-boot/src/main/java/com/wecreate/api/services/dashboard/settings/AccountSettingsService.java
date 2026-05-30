package com.wecreate.api.services.dashboard.settings;

import com.wecreate.api.models.dashboard.User;
import com.wecreate.api.repositories.dashboard.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.FederatedIdentityRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.wecreate.api.shared.dtos.dashboard.AccountSettingsResponse;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountSettingsService {

    private final UserRepository userRepository;
    private final Keycloak keycloak;

    @Value("${keycloak.realm}")
    private String realm;

    @Transactional
    public void updateProfile(String userId, String newUsername, String newFullName) {
        String normalizedUsername = normalizeUsername(newUsername);
        String normalizedFullName = normalizeFullName(newFullName);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Account not found. Try signing in again."));

        if (!user.getUsername().equals(normalizedUsername)
                && userRepository.existsByUsernameAndIdNot(normalizedUsername, userId)) {
            throw new IllegalStateException("This username is already taken.");
        }

        try {
            syncKeycloakProfile(userId, normalizedUsername, normalizedFullName, user.getUsername());
        } catch (Exception e) {
            log.warn("Failed to sync profile changes with Keycloak for user {}. Proceeding with local DB update. Error: {}",
                    userId, e.getMessage());
        }

        user.setUsername(normalizedUsername);
        user.setFullName(normalizedFullName);
        userRepository.save(user);

        log.info("Updated account profile for user {}", userId);
    }

    private void syncKeycloakProfile(String userId, String username, String fullName, String currentDbUsername) {
        String firstName = "";
        String lastName = "";
        if (fullName != null && !fullName.isBlank()) {
            String[] parts = fullName.trim().split("\\s+", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }

        try {
            UserRepresentation keycloakUser = keycloak.realm(realm)
                    .users()
                    .get(userId)
                    .toRepresentation();

            // Only attempt to change Keycloak's username if it has actually changed in the update request
            // compared to the current local database username.
            if (username != null && !username.equals(currentDbUsername)) {
                keycloakUser.setUsername(username);
            }

            keycloakUser.setFirstName(firstName);
            keycloakUser.setLastName(lastName);

            keycloak.realm(realm).users().get(userId).update(keycloakUser);
        } catch (Exception e) {
            log.error("Keycloak profile sync failed for user {}", userId, e);
            throw new IllegalStateException(
                    "Failed to sync profile changes with identity server: " + e.getMessage()
            );
        }
    }

    public AccountSettingsResponse getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Account not found."));
        return new AccountSettingsResponse(
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                hasGoogleFederatedIdentity(userId)
        );
    }

    private boolean hasGoogleFederatedIdentity(String userId) {
        try {
            return keycloak.realm(realm)
                    .users()
                    .get(userId)
                    .getFederatedIdentity()
                    .stream()
                    .map(FederatedIdentityRepresentation::getIdentityProvider)
                    .filter(idp -> idp != null && !idp.isBlank())
                    .anyMatch(idp -> idp.toLowerCase().contains("google"));
        } catch (Exception e) {
            log.warn("Could not read federated identities for user {}: {}", userId, e.getMessage());
            return false;
        }
    }

    private String normalizeUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required.");
        }
        String normalized = username.trim();
        if (normalized.contains("@")) {
            normalized = normalized.substring(0, normalized.indexOf('@'));
        }
        return normalized;
    }

    private String normalizeFullName(String fullName) {
        if (fullName == null) {
            return null;
        }
        String trimmed = fullName.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

}
