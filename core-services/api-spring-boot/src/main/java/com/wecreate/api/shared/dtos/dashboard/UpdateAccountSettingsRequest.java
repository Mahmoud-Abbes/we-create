package com.wecreate.api.shared.dtos.dashboard;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateAccountSettingsRequest(
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        String username,

        @Size(max = 120, message = "Full name must be at most 120 characters")
        String fullName
) {}
