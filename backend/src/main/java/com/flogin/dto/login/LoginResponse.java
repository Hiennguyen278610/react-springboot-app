package com.flogin.dto.login;

import com.flogin.dto.user.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

@Data
@Getter
@AllArgsConstructor

public class LoginResponse {
    private boolean success;
    private String message;
    private String token;
    private UserResponse userResponse;

    public LoginResponse(String message) {
        success = false;
        this.message = message;
    }
}
