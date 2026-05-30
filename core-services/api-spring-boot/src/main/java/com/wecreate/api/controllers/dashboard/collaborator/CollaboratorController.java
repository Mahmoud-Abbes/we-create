package com.wecreate.api.controllers.dashboard.collaborator;

import com.wecreate.api.services.dashboard.collaborator.CollaboratorService;
import com.wecreate.api.shared.dtos.dashboard.AddCollaboratorRequest;
import com.wecreate.api.shared.dtos.dashboard.GenerateCollaboratorLinkRequest;
import com.wecreate.api.shared.dtos.dashboard.GenerateCollaboratorLinkResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CollaboratorController {

    private final CollaboratorService collaboratorService;

    @PostMapping("/generateCollaboratorLink")
    public ResponseEntity<GenerateCollaboratorLinkResponse> generateCollaboratorLink(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody GenerateCollaboratorLinkRequest request
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(collaboratorService.generateCollaboratorLink(userId, request.slug()));
    }

    @PostMapping("/addCollaborator")
    public ResponseEntity<Void> addCollaborator(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody AddCollaboratorRequest request
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        collaboratorService.addCollaborator(userId, request);
        return ResponseEntity.noContent().build();
    }
}
