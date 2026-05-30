package com.wecreate.api.services.dashboard.project;

import com.wecreate.api.models.Project;
import com.wecreate.api.models.dashboard.UserProject;
import com.wecreate.api.repositories.dashboard.UserProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectAccessService {

    private final UserProjectRepository userProjectRepository;

    public UserProject requireMembership(UUID userId, String slug) {
        return userProjectRepository.findByUserIdAndProject_Slug(userId, slug)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Link unavailable"
                ));
    }

    public Project requireOwnerProject(UUID userId, String slug) {
        UserProject link = requireMembership(userId, slug);
        if (!"OWNER".equals(link.getRole())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the project owner can manage billing"
            );
        }
        return link.getProject();
    }

    public void requireOwnerOfProject(UUID userId, UUID projectId) {
        userProjectRepository.findByUserIdAndProject_Id(userId, projectId)
                .filter(link -> "OWNER".equals(link.getRole()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Only the project owner can manage billing"
                ));
    }
}
