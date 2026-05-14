package com.wecreate.api.repositories.dashboard;

import com.wecreate.api.models.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    boolean existsBySlug(String slug);
    Optional<Project> findBySlug(String slug);
}