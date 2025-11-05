package com.flogin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flogin.entity.Account;

public interface AccountRepository extends JpaRepository<Account, Long> {
    boolean existsByUsername(String username);
}
