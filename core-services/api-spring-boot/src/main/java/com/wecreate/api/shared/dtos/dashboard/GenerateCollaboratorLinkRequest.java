package com.wecreate.api.shared.dtos.dashboard;

import jakarta.validation.constraints.NotBlank;

public record GenerateCollaboratorLinkRequest(
        @NotBlank String slug
) {}
