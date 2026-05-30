package com.wecreate.api.controllers.dashboard.view;

import com.wecreate.api.services.dashboard.view.ProjectViewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
public class ProjectViewController {

    private final ProjectViewService projectViewService;

    public ProjectViewController(ProjectViewService projectViewService) {
        this.projectViewService = projectViewService;
    }

    @GetMapping("/view-details")
    public ResponseEntity<com.wecreate.api.shared.dtos.dashboard.ProjectViewDetailsResponse> getViewDetails(
            @RequestParam String slug,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(projectViewService.getViewDetails(slug, userId));
    }
}