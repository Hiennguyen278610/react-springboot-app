package com.flogin.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.flogin.entity.Account;
import com.flogin.repository.AccountRepository;

@Service
public class AccountService {
    @Autowired
    private AccountRepository repo;

    public Account create(Account account) {
        if (repo.existsByUsername(account.getUsername())) 
            throw new RuntimeException("Username đã tồn tại");
        return repo.save(account);
    }

    public List<Account> getAll() {
        return repo.findAll();
    }

    public Account getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
    }

    public Account update(Long id, Account account) {
        Account result = getById(id);
        result.setPassword(account.getPassword());
        return repo.save(result);
    }

    public void delete(Long id) {
        repo.delete(getById(id));
    }
}
