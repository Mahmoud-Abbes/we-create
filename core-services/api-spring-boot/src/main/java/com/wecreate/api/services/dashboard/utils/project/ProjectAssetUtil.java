package com.wecreate.api.services.dashboard.utils.project;

import com.wecreate.api.shared.dtos.llmconnector.showcase.ShowcaseRequest;
import com.google.gson.Gson;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ProjectAssetUtil {

    private final Gson gson;

    public String handleAssetsAndRefactorJson(ShowcaseRequest request, UUID projectId) throws Exception {
        // Placeholder for upload logic: projectId + currentTimeMillis() + filename
        // If an upload fails, this method must throw an Exception to trigger the orchestrator rollback
        Object userContext = request.getUserContext();
        return gson.toJson(userContext);
    }

    /**
     * Logic Step: Delete all files in Firebase storage that start with the projectId.
     */
    public void rollbackFirebaseUploads(UUID projectId) {
        System.out.println("Cleaning up Firebase files starting with: " + projectId);
        // TODO: Implement Firebase Storage 'listAll' filtered by prefix and delete
    }

    @SuppressWarnings("unchecked")
    public String extractCompanyName(ShowcaseRequest request) {
        try {
            Map<String, Object> context = (Map<String, Object>) request.getUserContext();
            Map<String, Object> identity = (Map<String, Object>) context.get("identity");
            return identity.get("companyName").toString();
        } catch (Exception e) {
            return "untitled-project";
        }
    }
}