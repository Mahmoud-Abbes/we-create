package com.wecreate.api.controllers.dashboard.auth;

import com.wecreate.api.services.dashboard.auth.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/sync")
    public ResponseEntity<String> syncUser(@AuthenticationPrincipal Jwt jwt) {
        // This takes the token, checks the ID, and saves to your DB if new
        userService.syncUserWithIdP(jwt);

        return ResponseEntity.ok("User synced successfully: " + jwt.getClaimAsString("preferred_username"));
    }
}
