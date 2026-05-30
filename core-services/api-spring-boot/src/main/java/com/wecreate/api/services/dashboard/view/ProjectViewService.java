package com.wecreate.api.services.dashboard.view;

import com.wecreate.api.models.Project;
import com.wecreate.api.models.dashboard.User;
import com.wecreate.api.models.dashboard.UserProject;
import com.wecreate.api.repositories.dashboard.ProjectRepository;
import com.wecreate.api.repositories.dashboard.UserProjectRepository;
import com.wecreate.api.repositories.dashboard.UserRepository;
import com.wecreate.api.services.dashboard.project.ProjectAccessService;
import com.wecreate.api.shared.dtos.dashboard.ProjectViewDetailsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectViewService {

    private final ProjectRepository projectRepository;
    private final UserProjectRepository userProjectRepository;
    private final UserRepository userRepository;
    private final ProjectAccessService projectAccessService;

    public ProjectViewDetailsResponse getViewDetails(String slug, UUID currentUserId) {
        // 1. Find project by slug, otherwise throw 404 Not Found
        Project project = projectRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found with slug: " + slug));

        UserProject membership = projectAccessService.requireMembership(currentUserId, slug);
        boolean isOwner = "OWNER".equals(membership.getRole());

        // 2. Retrieve collaborators linked to this project
        List<UserProject> userProjects = userProjectRepository.findByProject_Slug(slug);

        // 3. Map user projects to CollaboratorDto, resolving username from UserRepository
        List<ProjectViewDetailsResponse.CollaboratorDto> collaborators = userProjects.stream()
                .map(up -> {
                    String username = userRepository.findById(up.getUserId().toString())
                            .map(user -> {
                                String uname = user.getUsername();
                                if (uname != null && uname.contains("@")) {
                                    return uname.substring(0, uname.indexOf("@"));
                                }
                                return uname;
                            })
                            .orElse(""); // No fallback to Keycloak Subject ID / Email if User record not found
                    
                    return new ProjectViewDetailsResponse.CollaboratorDto(username, up.getRole());
                })
                .collect(Collectors.toList());

        return new ProjectViewDetailsResponse(
                project.getId().toString(),
                project.getSubStatus(),
                project.getBillingPlan(),
                project.getPeriodEndAt(),
                project.isDeployable(),
                isOwner,
                collaborators
        );
    }
}