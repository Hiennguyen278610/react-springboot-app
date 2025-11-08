package com.flogin.dto.auth;

import com.flogin.dto.user.UserResponse;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor

public class LoginResponse {
    private boolean success;
    private String message;
    private String token;
    private UserResponse userResponse;
}
