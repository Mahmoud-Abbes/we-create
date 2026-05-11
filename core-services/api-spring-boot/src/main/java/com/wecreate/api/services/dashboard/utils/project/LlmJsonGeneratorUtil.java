package com.wecreate.api.services.dashboard.utils.project;

import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class LlmJsonGeneratorUtil {

    private final WebClient aiWebClient;

    /**
     * Calls FastAPI /create-showcase to enhance the project JSON using LLM.
     */
    public Map<String, Object> generateShowcase(Map<String, Object> context) {
        Map<String, Object> response = aiWebClient.post()
                .uri("/create-showcase")
                .bodyValue(Map.of("userContext", context))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        if (response != null && response.containsKey("site_config")) {
            return (Map<String, Object>) response.get("site_config");
        }
        return context; // Fallback to original context if generation fails
    }

    /**
     * Empty placeholder for future Ecommerce generation.
     */
    public Map<String, Object> generateEcommerce(Map<String, Object> context) {
        // TODO: Implement Ecommerce generation
        return context;
    }
}
