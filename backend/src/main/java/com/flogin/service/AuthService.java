package com.flogin.service;

import org.springframework.stereotype.Service;

import com.flogin.dto.auth.LoginRequest;
import com.flogin.dto.auth.LoginResponse;

@Service
public class AuthService {
    public LoginResponse authenticate (LoginRequest loginRequest) {
        if (loginRequest == null) 
            return new LoginResponse(false, "Request không hợp lệ", null, null);
        return null;
    }
}
