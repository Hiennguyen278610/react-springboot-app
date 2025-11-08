package com.flogin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flogin.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
}
