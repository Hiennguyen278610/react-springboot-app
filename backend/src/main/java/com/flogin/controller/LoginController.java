package com.flogin.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flogin.dto.login.LoginRequest;
import com.flogin.dto.login.LoginResponse;
import com.flogin.dto.user.UserResponse;
import com.flogin.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")

public class LoginController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.authenticate(req));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return ResponseEntity.ok(authService.getCurrentUser(authorizationHeader));
    }

}