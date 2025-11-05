package com.flogin.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flogin.dto.account.AccountResponse;
import com.flogin.dto.account.CreateAccountRequest;
import com.flogin.dto.account.UpdateAccountRequest;
import com.flogin.entity.Account;
import com.flogin.mapper.AccountMapper;
import com.flogin.service.AccountService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/backend/api/accounts")

public class AccountController {
    @Autowired
    private AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountResponse> create(@Valid @RequestBody CreateAccountRequest req) {
        Account entity = accountService.create(AccountMapper.toEntity(req));
        AccountResponse res = AccountMapper.toResponse(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAll() {
        return ResponseEntity.ok(AccountMapper.toResponses(accountService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getById (@PathVariable Long id) {
        return ResponseEntity.ok(AccountMapper.toResponse(accountService.getById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateAccountRequest req) { 
        return ResponseEntity.ok(AccountMapper.toResponse(accountService.update(id, AccountMapper.toEntity(req))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        accountService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
