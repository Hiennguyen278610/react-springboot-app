package com.flogin.backend.unit;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.flogin.backend.baseFake.BaseFakeUserRepository;
import com.flogin.configuration.JwtTokenProvider;
import com.flogin.dto.login.LoginRequest;
import com.flogin.dto.login.LoginResponse;
import com.flogin.dto.user.UserResponse;
import com.flogin.entity.UserEntity;
import com.flogin.exception.AuthException;
import com.flogin.exception.NotFoundException;
import com.flogin.repository.UserRepository;
import com.flogin.service.AuthService;

public class AuthServiceTest {

    private AuthService authService;
    private UserRepository fakeUserRepository;
    private PasswordEncoder fakePasswordEncoder;
    private JwtTokenProvider fakeJwtTokenProvider;
    private UserEntity fakeUser;

    @BeforeEach
    void setUp() {
        fakePasswordEncoder = new PasswordEncoder() {
            @Override
            public String encode(CharSequence rawPassword) {
                return rawPassword.toString() + "_encoded";
            }

            @Override
            public boolean matches(CharSequence rawPassword, String encodedPassword) {
                return (rawPassword.toString() + "_encoded").equals(encodedPassword);
            }
        };

        fakeJwtTokenProvider = new JwtTokenProvider() {
            @Override
            public String generateToken(String username) {
                return "fake-jwt-token-2k5";
            }

            @Override
            public String getUsernameFromToken(String token) {
                if ("fake-jwt-token-2k5".equals(token)) {
                    return "hyan123";
                }
                return null;
            }

            @Override
            public boolean validateToken(String token) {
                return "fake-jwt-token-2k5".equals(token);
            }
        };

        fakeUser = UserEntity.builder().id(1L)
                .username("hyan123")
                .password("password123_encoded")
                .mail("hyan123@gmail.com").build();

        fakeUserRepository = new BaseFakeUserRepository() {
            @Override
            public boolean existsByMail(String email) {
                return "hyan123@gmail.com".equals(email);
            }

            @Override
            public boolean existsByUsername(String username) {
                return "hyan123".equals(username);
            }

            @Override
            public Optional<UserEntity> findByUsername(String username) {
                if ("hyan123".equals(username))
                    return Optional.of(fakeUser);
                return Optional.empty();
            }
        };

        authService = new AuthService(fakeUserRepository, fakePasswordEncoder, fakeJwtTokenProvider);
    }

    @Test
    @DisplayName("TC_LOGIN_001: Đăng nhập thành công với credentials hợp lệ")
    void testLoginSuccess() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("hyan123", "password123");

        // Action
        LoginResponse response = authService.authenticate(loginRequest);

        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Đăng nhập thành công", response.getMessage());
        assertEquals("fake-jwt-token-2k5", response.getToken());
        assertNotNull(response.getUserResponse());
        assertEquals("hyan123", response.getUserResponse().getUsername());
    }

    @Test
    @DisplayName("TC_LOGIN_002: Đăng nhập thất bại khi user không tồn tại")
    void testAuthUserNotFound() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("hyanNega123", "password123");

        // Action
        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            authService.authenticate(loginRequest);
        });
        // Assert
        assertEquals("Tài khoản hoặc mật khẩu không đúng", exception.getMessage());
    }

    @Test
    @DisplayName("TC_LOGIN_003: Đăng nhập thất bại khi mật khẩu sai")
    void testAuthWrongPassword() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("hyan123", "haha123");

        // Action
        AuthException exception = assertThrows(AuthException.class, () -> {
            authService.authenticate(loginRequest);
        });
        // Assert
        assertEquals("Mật khẩu không chính xác", exception.getMessage());
    }

    @Test
    @DisplayName("TC_LOGIN_004: Lấy người dùng hiện tại thành công với token hợp lệ")
    void testGetCurrentUserSuccess() {
        // Arrange
        String authorizationHeader = "Bearer fake-jwt-token-2k5";

        // Action
        UserResponse response = authService.getCurrentUser(authorizationHeader);

        // Assert
        assertNotNull(response);
        assertEquals("hyan123", response.getUsername());
        assertEquals("hyan123@gmail.com", response.getMail());
    }

    @Test
    @DisplayName("TC_LOGIN_005: Lỗi khi header xác thực bị thiếu")
    void testGetCurrentUserHeaderNull() {
        // Action
        AuthException exception = assertThrows(AuthException.class, () -> {
            authService.getCurrentUser(null);
        });
        // Assert
        assertEquals("Thiếu header xác thực", exception.getMessage());
    }

    @Test
    @DisplayName("TC_LOGIN_006: Lỗi khi token không hợp lệ")
    void testGetCurrentUserInvalidToken() {
        // Arrange
        String authorizationHeader = "Bearer haha-token";

        // Action
        AuthException exception = assertThrows(AuthException.class, () -> {
            authService.getCurrentUser(authorizationHeader);
        });
        // Assert
        assertEquals("Token không hợp lệ", exception.getMessage());
    }
}
