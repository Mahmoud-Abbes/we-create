package com.wecreate.api.services.engine;

import com.wecreate.api.models.Project;
import com.wecreate.api.repositories.dashboard.ProjectRepository;
import com.wecreate.api.shared.dtos.engine.ProjectPublicDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EngineService {
    private final ProjectRepository projectRepository;
    private final TokenService tokenService;

    @Transactional
    public ProjectPublicDTO getProjectForEngine(String slug, String previewToken, String origin) {
        Project project = projectRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        String siteTemplateType = resolveSiteTemplateType(project.getProjectType());

        if ("dashboard".equals(origin)) {
            // 1. Dashboard Preview Flow: REQUIRES VALID TOKEN
            if (tokenService.validateAndBurn(previewToken, slug)) {
                return new ProjectPublicDTO(project.getJsonContent(), siteTemplateType);
            } else {
                // Token invalid, expired, or already burned
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid or expired preview token.");
            }
        } else {
            // 2. Public browser flow: access while billing period is active (incl. cancelled until period end)
            return getPublicProject(project, siteTemplateType);
        }
    }

    private ProjectPublicDTO getPublicProject(Project project, String siteTemplateType) {
        if (!project.isDeployable()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Can't load: project is not deployable"
            );
        }

        if (hasActiveBillingPeriod(project)) {
            return new ProjectPublicDTO(project.getJsonContent(), siteTemplateType);
        }

        markPastDueIfPeriodEnded(project);

        String reason = project.getSubStatus() == null ? "No Subscription" : project.getSubStatus();
        throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "Can't load: Status is " + reason);
    }

    /**
     * Paid access is valid until {@code periodEndAt}. Cancelled subscriptions keep access until then.
     * Without a period end, only an explicitly ACTIVE status grants access.
     */
    private boolean hasActiveBillingPeriod(Project project) {
        LocalDateTime periodEnd = project.getPeriodEndAt();
        if (periodEnd != null) {
            return LocalDateTime.now().isBefore(periodEnd);
        }
        return "ACTIVE".equals(project.getSubStatus());
    }

    /** After period end, non-cancelled projects move to PAST_DUE. */
    private void markPastDueIfPeriodEnded(Project project) {
        String status = project.getSubStatus();
        if (status == null || "CANCELED".equals(status) || "PAST_DUE".equals(status)) {
            return;
        }
        project.setSubStatus("PAST_DUE");
        projectRepository.save(project);
    }

    /**
     * Returns the site-engine template id. Billing plan names must never be sent here
     * (legacy rows may have them in project_type after a mistaken webhook write).
     */
    private String resolveSiteTemplateType(String projectType) {
        if (projectType == null || projectType.isBlank()) {
            return "SHOWCASE";
        }
        return switch (projectType.toUpperCase()) {
            case "SUBSCRIPTION", "THREE_MONTHS", "ONE_MONTH" -> "SHOWCASE";
            case "SHOWCASE", "ECOMMERCE" -> projectType.toUpperCase();
            default -> "SHOWCASE";
        };
    }
}