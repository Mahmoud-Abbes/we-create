package com.wecreate.api.controllers.dashboard.project;

import com.wecreate.api.shared.dtos.dashboard.ProjectSidebarDTO;
import com.wecreate.api.repositories.dashboard.UserProjectRepository;
import com.wecreate.api.services.engine.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final UserProjectRepository userProjectRepository;
    private final TokenService tokenService;

    @GetMapping("/sidebar")
    public ResponseEntity<List<ProjectSidebarDTO>> getSidebarProjects(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        List<ProjectSidebarDTO> projects = userProjectRepository.findAll().stream()
                .filter(up -> up.getUserId().equals(userId))
                .map(up -> new ProjectSidebarDTO(
                        up.getProject().getSlug()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(projects);
    }

    @PostMapping("/{identifier}/preview-token")
    public ResponseEntity<Map<String, String>> getPreviewToken(
            @PathVariable String identifier,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String userId = jwt.getSubject();

        // 1. Try to find by Slug, fallback to ID if it's a UUID
        com.wecreate.api.models.dashboard.UserProject up = userProjectRepository.findByUserIdAndProject_Slug(userId, identifier)
                .or(() -> userProjectRepository.findByUserIdAndProject_Id(userId, identifier))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied or project not found: " + identifier));

        // 2. Generate the one-time burner token using the ACTUAL slug
        String actualSlug = up.getProject().getSlug();
        String token = tokenService.generateToken(actualSlug);

        return ResponseEntity.ok(Map.of("previewToken", token));
    }
}