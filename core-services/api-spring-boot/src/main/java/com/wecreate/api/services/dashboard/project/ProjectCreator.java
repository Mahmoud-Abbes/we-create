package com.wecreate.api.services.dashboard.project;

import com.wecreate.api.shared.dtos.llmconnector.showcase.ShowcaseRequest;
import com.wecreate.api.shared.dtos.llmconnector.showcase.ShowcaseResponse;
import com.wecreate.api.models.Project;
import com.wecreate.api.services.dashboard.utils.project.ProjectPersistenceUtil;
import com.wecreate.api.services.dashboard.utils.project.ProjectAssetUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.wecreate.api.services.dashboard.utils.project.LlmJsonGeneratorUtil;
import com.google.gson.Gson;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectCreator {

    private final ProjectPersistenceUtil persistenceUtil;
    private final ProjectAssetUtil assetUtil;
    private final LlmJsonGeneratorUtil llmGenerator;
    private final Gson gson;

    /**
     * Orchestrates the flow with a manual rollback mechanism for external services.
     */
    @Transactional
    public ShowcaseResponse createProject(ShowcaseRequest request, Jwt jwt, String projectType) {
        UUID currentProjectId = null;

        try {
            // 1. Setup
            String companyName = assetUtil.extractCompanyName(request);
            String userId = jwt == null ? null : jwt.getSubject();

            // 2. Create DB Records (Get ID)
            Project newProject = persistenceUtil.createEmptyProject(companyName);
            currentProjectId = newProject.getId();

            if (userId != null && !userId.isBlank()) {
                persistenceUtil.createUserProjectLink(userId, newProject, "OWNER");
            }

            // 3. External Service: Firebase Upload & JSON Refactor
            // If this fails, it throws an exception handled by the catch block
            String refactoredJson = assetUtil.handleAssetsAndRefactorJson(request, currentProjectId);

            // 3.5 LLM Generation: Enhance the refactored JSON
            @SuppressWarnings("unchecked")
            Map<String, Object> refactoredMap = gson.fromJson(refactoredJson, Map.class);
            Map<String, Object> llmResult = llmGenerator.generateShowcase(refactoredMap);
            String finalJson = gson.toJson(llmResult);

            // 4. Final Update
            persistenceUtil.updateProjectContent(currentProjectId, finalJson);

            ShowcaseResponse response = new ShowcaseResponse();
            response.setCreationStatus("success");
            response.setProjectId(currentProjectId.toString());
            return response;

        } catch (Exception e) {
            System.err.println("Critical failure in project creation. Initiating rollback...");
            e.printStackTrace();

            // Manual Rollback Sequence
            if (currentProjectId != null) {
                // Remove files from Firebase
                assetUtil.rollbackFirebaseUploads(currentProjectId);

                // Remove records from DB
                // Since this is inside @Transactional, the DB will roll back automatically
                // on exception, but calling explicit delete ensures local cleanup if needed.
                persistenceUtil.rollbackProjectCreation(currentProjectId);
            }

            ShowcaseResponse errorResponse = new ShowcaseResponse();
            errorResponse.setCreationStatus("fail");
            return errorResponse;
        }
    }
}