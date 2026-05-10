package com.wecreate.api.repositories.dashboard;

import com.wecreate.api.models.dashboard.UserProject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProjectRepository extends JpaRepository<UserProject, Long> {
}