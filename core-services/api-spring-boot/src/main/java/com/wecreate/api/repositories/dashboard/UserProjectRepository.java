package com.wecreate.api.repositories.dashboard;

import com.wecreate.api.models.dashboard.UserProject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserProjectRepository extends JpaRepository<UserProject, Long> {
    Optional<UserProject> findByUserIdAndProject_Slug(String userId, String slug);
    Optional<UserProject> findByUserIdAndProject_Id(String userId, String projectId);
}