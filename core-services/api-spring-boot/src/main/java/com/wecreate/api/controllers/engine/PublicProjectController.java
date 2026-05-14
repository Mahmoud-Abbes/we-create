package com.wecreate.api.controllers.engine;

import com.wecreate.api.services.engine.EngineService;
import com.wecreate.api.shared.dtos.engine.ProjectPublicDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/public/projects")
@RequiredArgsConstructor
public class PublicProjectController {
    private final EngineService engineService;

    @GetMapping("/{slug}")
    public ProjectPublicDTO getProject(
            @PathVariable String slug,
            @RequestHeader("X-WeCreate-Engine-Key") String engineKey,
            @RequestParam(required = false) String previewToken,
            @RequestParam(required = false) String origin) {

        if (!"uqsdf57fq5s-internal-key".equals(engineKey)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return engineService.getProjectForEngine(slug, previewToken, origin);
    }
}