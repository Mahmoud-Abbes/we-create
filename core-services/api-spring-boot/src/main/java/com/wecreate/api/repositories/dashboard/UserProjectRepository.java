package com.wecreate.api.repositories.dashboard;

import com.wecreate.api.models.dashboard.UserProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserProjectRepository extends JpaRepository<UserProject, UUID> {
    @Query("SELECT up FROM UserProject up JOIN FETCH up.project WHERE up.userId = :userId")
    List<UserProject> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT up FROM UserProject up JOIN FETCH up.project WHERE up.userId = :userId AND up.project.slug = :slug")
    Optional<UserProject> findByUserIdAndProject_SlugWithProject(
            @Param("userId") UUID userId,
            @Param("slug") String slug
    );

    Optional<UserProject> findByUserIdAndProject_Slug(UUID userId, String slug);

    Optional<UserProject> findByUserIdAndProject_Id(UUID userId, UUID projectId);

    Optional<UserProject> findFirstByProject_IdAndRole(UUID projectId, String role);

    Optional<UserProject> findByProjectStripeSubId(String stripeSubId);

    List<UserProject> findByProject_Slug(String slug);
}
