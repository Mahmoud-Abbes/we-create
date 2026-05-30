package com.wecreate.api.shared.dtos.dashboard;

import java.time.LocalDateTime;
import java.util.List;

public record ProjectViewDetailsResponse(
        String id,
        String subscriptionStatus,
        String planType,
        LocalDateTime planDate,
        boolean deployable,
        boolean isOwner,
        List<CollaboratorDto> collaborators
) {
    public record CollaboratorDto(String username, String role) {}
}