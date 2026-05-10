package com.wecreate.api.services.dashboard.project;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.wecreate.api.shared.dtos.llmconnector.showcase.ShowcaseRequest;
import com.wecreate.api.shared.dtos.llmconnector.showcase.ShowcaseResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.UUID;

@Service
public class ShowcaseCreatorService {

    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    public ResponseEntity<ShowcaseResponse> processProjectFinalization(ShowcaseRequest request, Jwt jwt) {
        System.out.println("Received ShowcaseRequest:\n" + gson.toJson(request));

        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        ShowcaseResponse response = new ShowcaseResponse();
        Random random = new Random();

        if (random.nextInt(10) < 7) {
            response.setCreationStatus("success");
            response.setProjectId(UUID.randomUUID().toString());
            return ResponseEntity.ok(response);
        } else {
            response.setCreationStatus("fail");
            response.setProjectId(null);
            return ResponseEntity.internalServerError().body(response);
        }
    }
}