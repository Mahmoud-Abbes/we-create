package com.wecreate.api.services.dashboard.utils.project;

import com.wecreate.api.models.Project;

import com.wecreate.api.models.dashboard.UserProject;
import com.wecreate.api.repositories.dashboard.ProjectRepository;
import com.wecreate.api.repositories.dashboard.UserProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.Random;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ProjectPersistenceUtil {

    private final ProjectRepository projectRepository;
    private final UserProjectRepository userProjectRepository;

    public Project createEmptyProject(String companyName, String projectType) {
        Project project = new Project();
        project.setSlug(this.generateUniqueSlug(companyName));
        project.setJsonContent("");
        project.setProjectType(projectType);
        return projectRepository.save(project);
    }

    public void updateProjectContent(UUID projectId, String finalJson) {
        projectRepository.findById(projectId).ifPresent(project -> {
            project.setJsonContent(finalJson);
            projectRepository.save(project);
        });
    }

    public void createUserProjectLink(String userId, Project project, String role) {
        UserProject link = new UserProject();
        link.setUserId(userId);
        link.setProject(project);
        link.setRole(role);
        userProjectRepository.save(link);
    }

    /**
     * Logic Step: Hard delete project and its links if the process fails.
     */
    public void rollbackProjectCreation(UUID projectId) {
        // user_projects has a foreign key to projects,
        // normally we delete links first if not using CascadeDelete
        projectRepository.deleteById(projectId);
    }

    private String generateUniqueSlug(String companyName) {
        String baseSlug = companyName.toLowerCase().trim()
                .replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", "-");
        String finalSlug = baseSlug;
        while (projectRepository.existsBySlug(finalSlug)) {
            finalSlug = baseSlug + "-" + generateRandomAlphanumeric(3);
        }
        return finalSlug;
    }

    private String generateRandomAlphanumeric(int len) {
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        Random rnd = new Random();
        for (int i = 0; i < len; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        return sb.toString();
    }
}