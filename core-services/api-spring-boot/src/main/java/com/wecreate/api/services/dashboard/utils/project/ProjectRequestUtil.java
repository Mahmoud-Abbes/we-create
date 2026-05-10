package com.wecreate.api.services.dashboard.utils.project;

import com.wecreate.api.shared.dtos.llmconnector.showcase.ShowcaseRequest;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class ProjectRequestUtil {

    private final Gson gson;

    /**
     * Logic Step: Serializes the UserContext into a JSON string.
     * We handle it as a Map to avoid "getIdentity" resolution issues.
     */
    public String serializeContext(ShowcaseRequest request) {
        if (request == null || request.getUserContext() == null) {
            return "{}";
        }
        return gson.toJson(request.getUserContext());
    }

    /**
     * Logic Step: Safely extracts the company name from the nested Map structure.
     */
    @SuppressWarnings("unchecked")
    public String extractCompanyName(ShowcaseRequest request) {
        try {
            // Get userContext as a Map
            Map<String, Object> context = (Map<String, Object>) request.getUserContext();

            // Get identity from the map
            Map<String, Object> identity = (Map<String, Object>) context.get("identity");

            // Get companyName from the identity map
            Object companyName = identity.get("companyName");

            return (companyName != null) ? companyName.toString() : "default-project";
        } catch (Exception e) {
            // Fallback if the map structure doesn't match expectations
            return "untitled-project";
        }
    }
}