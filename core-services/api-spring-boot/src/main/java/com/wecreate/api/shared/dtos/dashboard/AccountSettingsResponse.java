package com.wecreate.api.shared.dtos.dashboard;

public record AccountSettingsResponse(
        String username,
        String email,
        String fullName,
        boolean googleLinked
) {}
