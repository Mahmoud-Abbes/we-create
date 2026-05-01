package com.wecreate.api.controllers.testing;

import com.wecreate.api.services.dashboard.project.LlmTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class ConnectivityController {

    private final LlmTestService llmTestService;

    // Spring Boot Health Check
    @GetMapping("/health")
    public Map<String, String> brainHealth() {
        Map<String, String> status = new HashMap<>();
        status.put("api_status", "UP");
        status.put("framework", "Spring Boot");
        return status;
    }

    // LLM Connector Health Check
    @GetMapping("/ai-health")
    public Mono<Map<String, Object>> aiEngineHealth() {
        return llmTestService.getAiEngineStatus();
    }

    // LLM Connection Test
    @GetMapping("/ai-welcoming")
    public Mono<Map<String, Object>> checkAi() {
        return llmTestService.runAiWelcomeTest();
    }
}