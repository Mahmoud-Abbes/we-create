package com.wecreate.api.services.dashboard.collaborator;

import com.wecreate.api.models.Project;
import com.wecreate.api.models.dashboard.UserProject;
import com.wecreate.api.repositories.dashboard.ProjectRepository;
import com.wecreate.api.repositories.dashboard.UserProjectRepository;
import com.wecreate.api.services.dashboard.utils.project.ProjectPersistenceUtil;
import com.wecreate.api.shared.dtos.dashboard.AddCollaboratorRequest;
import com.wecreate.api.shared.dtos.dashboard.GenerateCollaboratorLinkResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CollaboratorService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final CollaboratorInviteStore inviteStore;
    private final UserProjectRepository userProjectRepository;
    private final ProjectRepository projectRepository;
    private final ProjectPersistenceUtil projectPersistenceUtil;

    public GenerateCollaboratorLinkResponse generateCollaboratorLink(UUID userId, String slug) {
        UserProject ownerLink = userProjectRepository.findByUserIdAndProject_Slug(userId, slug)
                .filter(up -> "OWNER".equals(up.getRole()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Only the project owner can generate a collaborator link"
                ));

        Project project = ownerLink.getProject();
        String inviteKey = createInviteKey();
        inviteStore.put(inviteKey, project.getId(), project.getSlug(), userId);

        return new GenerateCollaboratorLinkResponse(inviteKey, project.getSlug());
    }

    @Transactional
    public void addCollaborator(UUID userId, AddCollaboratorRequest request) {
        CollaboratorInviteStore.InviteEntry invite = inviteStore
                .consume(request.inviteKey(), request.slug())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid or expired collaborator invite link"
                ));

        if (invite.ownerUserId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The project owner cannot join as a collaborator"
            );
        }

        Project project = projectRepository.findBySlug(request.slug())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        if (!project.getId().equals(invite.projectId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invite does not match this project");
        }

        if (userProjectRepository.findByUserIdAndProject_Slug(userId, request.slug()).isPresent()) {
            return;
        }

        projectPersistenceUtil.createUserProjectLink(userId, project, "COLLABORATOR");
    }

    private String createInviteKey() {
        byte[] bytes = new byte[24];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
