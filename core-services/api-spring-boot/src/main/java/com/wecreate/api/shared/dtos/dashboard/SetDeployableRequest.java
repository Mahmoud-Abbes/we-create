package com.wecreate.api.shared.dtos.dashboard;

import jakarta.validation.constraints.NotNull;

public record SetDeployableRequest(@NotNull Boolean deployable) {}
