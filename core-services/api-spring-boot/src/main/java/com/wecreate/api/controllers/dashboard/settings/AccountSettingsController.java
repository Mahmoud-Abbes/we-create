package com.wecreate.api.controllers.dashboard.settings;

import com.wecreate.api.services.dashboard.settings.AccountSettingsService;
import com.wecreate.api.shared.dtos.dashboard.AccountSettingsResponse;
import com.wecreate.api.shared.dtos.dashboard.UpdateAccountSettingsRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/account")
@RequiredArgsConstructor
public class AccountSettingsController {

    private final AccountSettingsService accountSettingsService;

    @GetMapping("/settings")
    public ResponseEntity<AccountSettingsResponse> getSettings(
            @AuthenticationPrincipal Jwt jwt
    ) {
        AccountSettingsResponse response = accountSettingsService.getProfile(jwt.getSubject());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/settings")
    public ResponseEntity<Void> updateSettings(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateAccountSettingsRequest request
    ) {
        accountSettingsService.updateProfile(
                jwt.getSubject(),
                request.username(),
                request.fullName()
        );
        return ResponseEntity.noContent().build();
    }
}
