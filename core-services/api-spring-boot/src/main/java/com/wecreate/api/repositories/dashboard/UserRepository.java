package com.wecreate.api.repositories.dashboard;

import com.wecreate.api.models.dashboard.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    // Spring Data JPA handles the CRUD (Save, Delete, Find) automatically
}
