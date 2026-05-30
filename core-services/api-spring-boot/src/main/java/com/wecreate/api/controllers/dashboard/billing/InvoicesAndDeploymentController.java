package com.wecreate.api.controllers.dashboard.billing;

import com.wecreate.api.services.dashboard.billing.InvoicesAndDeploymentService;
import com.wecreate.api.shared.dtos.dashboard.InvoicesAndDeploymentResponse;
import com.wecreate.api.shared.dtos.dashboard.SetDeployableRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/invoices-deployment")
@RequiredArgsConstructor
public class InvoicesAndDeploymentController {

    private final InvoicesAndDeploymentService invoicesAndDeploymentService;

    @GetMapping("/{slug}")
    public ResponseEntity<InvoicesAndDeploymentResponse> getInvoicesAndDeployment(
            @PathVariable String slug,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(invoicesAndDeploymentService.getForProject(userId, slug));
    }

    @PatchMapping("/{slug}/deployable")
    public ResponseEntity<Void> setDeployable(
            @PathVariable String slug,
            @Valid @RequestBody SetDeployableRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        invoicesAndDeploymentService.setDeployable(userId, slug, request.deployable());
        return ResponseEntity.noContent().build();
    }
}
