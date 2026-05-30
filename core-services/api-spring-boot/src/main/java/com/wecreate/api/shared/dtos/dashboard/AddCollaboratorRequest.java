package com.wecreate.api.shared.dtos.dashboard;

import jakarta.validation.constraints.NotBlank;

public record AddCollaboratorRequest(
        @NotBlank String inviteKey,
        @NotBlank String slug
) {}
