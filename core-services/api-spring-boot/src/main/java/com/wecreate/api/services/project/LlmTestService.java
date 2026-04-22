package com.wecreate.api.services.project;

import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class LlmTestService {

    private final WebClient aiWebClient;

    /**
     * Checks if the FastAPI LLM Connector is reachable.
     */
    public Mono<Map<String, Object>> getAiEngineStatus() {
        return aiWebClient.get()
                .uri("/health")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }

    /**
     * Checks if the FastAPI Connector can talk to LLM model.
     */
    public Mono<Map<String, Object>> runAiWelcomeTest() {
        return aiWebClient.get()
                .uri("/test-ai")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }
}