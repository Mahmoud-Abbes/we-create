package com.wecreate.api.services.dashboard.collaborator;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CollaboratorInviteStore {

    private static final long TTL_SECONDS = 48 * 60 * 60;

    private final Map<String, InviteEntry> invites = new ConcurrentHashMap<>();

    public void put(String key, UUID projectId, String projectSlug, UUID ownerUserId) {
        purgeExpired();
        invites.put(key, new InviteEntry(projectId, projectSlug, ownerUserId, Instant.now().plusSeconds(TTL_SECONDS)));
    }

    public Optional<InviteEntry> consume(String key, String projectSlug) {
        purgeExpired();
        InviteEntry entry = invites.remove(key);
        if (entry == null) {
            return Optional.empty();
        }
        if (!entry.projectSlug().equals(projectSlug)) {
            return Optional.empty();
        }
        if (entry.expiresAt().isBefore(Instant.now())) {
            return Optional.empty();
        }
        return Optional.of(entry);
    }

    private void purgeExpired() {
        Instant now = Instant.now();
        invites.entrySet().removeIf(e -> e.getValue().expiresAt().isBefore(now));
    }

    public record InviteEntry(UUID projectId, String projectSlug, UUID ownerUserId, Instant expiresAt) {}
}
