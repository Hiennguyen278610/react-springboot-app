package com.flogin.mapper;

import java.util.List;

import com.flogin.dto.account.AccountResponse;
import com.flogin.dto.account.CreateAccountRequest;
import com.flogin.dto.account.UpdateAccountRequest;
import com.flogin.entity.Account;

public class AccountMapper {
    public static Account toEntity(CreateAccountRequest req) {
        Account account = new Account();
        account.setUsername(req.getUsername());
        account.setPassword(req.getPassword());
        return account;
    }    
    
    public static Account toEntity(UpdateAccountRequest req) {
        Account account = new Account();
        account.setPassword(req.getPassword());
        return account;
    }

    public static AccountResponse toResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getUsername());
    }

    public static List<AccountResponse> toResponses(List<Account> accounts) {
        return accounts.stream().map(AccountMapper::toResponse).toList();
    }
}