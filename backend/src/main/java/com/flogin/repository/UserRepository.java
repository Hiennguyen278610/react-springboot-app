package com.flogin.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flogin.entity.UserEntity;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    boolean existsByMail(String email);
    boolean existsByUsername(String username);
    Optional<UserEntity> findByUsername(String username);
}