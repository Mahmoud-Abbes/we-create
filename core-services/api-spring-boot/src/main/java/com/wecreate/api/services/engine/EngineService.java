package com.wecreate.api.services.engine;

import com.wecreate.api.models.Project;
import com.wecreate.api.repositories.dashboard.ProjectRepository;
import com.wecreate.api.shared.dtos.engine.ProjectPublicDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class EngineService {
    private final ProjectRepository projectRepository;
    private final TokenService tokenService;

    public ProjectPublicDTO getProjectForEngine(String slug, String previewToken, String origin) {
        Project project = projectRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if ("dashboard".equals(origin)) {
            // 1. Dashboard Preview Flow: REQUIRES VALID TOKEN
            if (tokenService.validateAndBurn(previewToken, slug)) {
                return new ProjectPublicDTO(project.getJsonContent(), project.getProjectType());
            } else {
                // Token invalid, expired, or already burned
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid or expired preview token.");
            }
        } else {
            // 2. Public Browser Flow: REQUIRES ACTIVE STATUS
            if ("ACTIVE".equals(project.getSubStatus())) {
                return new ProjectPublicDTO(project.getJsonContent(), project.getProjectType());
            } else {
                // Detailed error for the Engine to display why it's not live
                String reason = (project.getSubStatus() == null) ? "No Subscription" : project.getSubStatus();
                throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "Can't load: Status is " + reason);
            }
        }
    }
}