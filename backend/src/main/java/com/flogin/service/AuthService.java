package com.flogin.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.flogin.configuration.JwtTokenProvider;
import com.flogin.dto.login.LoginRequest;
import com.flogin.dto.login.LoginResponse;
import com.flogin.dto.user.UserResponse;
import com.flogin.entity.UserEntity;
import com.flogin.mapper.UserMapper;
import com.flogin.repository.UserRepository;

import com.flogin.exception.AuthException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class AuthService {
    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public LoginResponse authenticate(LoginRequest loginRequest) {
        UserEntity user = repo.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new AuthException("Tài khoản hoặc mật khẩu không đúng", HttpStatus.NOT_FOUND));
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword()))
            throw new AuthException("Mật khẩu không chính xác", HttpStatus.UNAUTHORIZED);
        return new LoginResponse(true, "Đăng nhập thành công", jwtTokenProvider.generateToken(user.getUsername()), UserMapper.toResponse(user));
    }

    public UserResponse getCurrentUser(String authorizationHeader) {
        String token = extractToken(authorizationHeader);

        if (!jwtTokenProvider.validateToken(token)) {
            throw new AuthException("Token không hợp lệ", HttpStatus.UNAUTHORIZED);
        }

        String username = jwtTokenProvider.getUsernameFromToken(token);
        UserEntity user = repo.findByUsername(username)
                .orElseThrow(() -> new AuthException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));

        return UserMapper.toResponse(user);
    }

    private String extractToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new AuthException("Thiếu header xác thực", HttpStatus.UNAUTHORIZED);
        }
        return authorizationHeader.substring(7);
    }
}
