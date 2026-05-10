package com.wecreate.api.controllers.project;

import com.wecreate.api.services.dashboard.project.ProjectCreator;
import com.wecreate.api.shared.dtos.llmconnector.showcase.ShowcaseRequest;
import com.wecreate.api.shared.dtos.llmconnector.showcase.ShowcaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/project")
@RequiredArgsConstructor
public class ShowcaseController {

    private final ProjectCreator projectCreator;

    @PostMapping("/finalize")
    public ResponseEntity<ShowcaseResponse> finalizeProject(
            @RequestBody ShowcaseRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        if (request == null || request.getUserContext() == null || request.getUserContext().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing required field: userContext");
        }
        System.out.println(
                "Finalize project request received. userContext keys=" + request.getUserContext().keySet()
                        + ", userAssets=" + (request.getUserAssets() == null ? 0 : request.getUserAssets().size())
                        + ", userId=" + (jwt == null ? "anonymous" : jwt.getSubject())
        );

        // Delegates everything to the orchestrator
        ShowcaseResponse response = projectCreator.createProject(request, jwt, "SHOWCASE");

        // A "fail" here is a business outcome from the orchestrator (it already rolled back).
        // Reserve 5xx for truly unhandled exceptions (which would bubble up anyway).
        return ResponseEntity.ok(response);
    }
}