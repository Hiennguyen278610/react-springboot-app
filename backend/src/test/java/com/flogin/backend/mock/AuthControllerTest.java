package com.flogin.backend.mock;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flogin.controller.LoginController;
import com.flogin.dto.login.LoginRequest;
import com.flogin.dto.login.LoginResponse;
import com.flogin.dto.user.UserResponse;
import com.flogin.exception.AuthException;
import com.flogin.exception.GlobalExceptionHandler;
import com.flogin.exception.NotFoundException;
import com.flogin.service.AuthService;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    private MockMvc mockMvc;
    @Mock
    private AuthService authService;
    @InjectMocks
    private LoginController loginController;
    private ObjectMapper objectMapper;
    private UserResponse mockUserResponse;
    private LoginResponse mockLoginResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(loginController)
                .setControllerAdvice(new GlobalExceptionHandler()).build();
        objectMapper = new ObjectMapper();

        mockUserResponse = new UserResponse(1L, "hyank23", "hyan123@gmail.com");
        mockLoginResponse = new LoginResponse(true, "Đăng nhập thành công", "jwt-token", mockUserResponse);
    }

    private ResultActions performPost(String url, Object body) throws Exception {
        return mockMvc.perform(post(url)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }

    private ResultActions performGet(String url, String authHeader) throws Exception {
        return mockMvc.perform(get(url)
                .header("Authorization", authHeader));
    }

    private ResultActions performGet(String url) throws Exception {
        return mockMvc.perform(get(url));
    }

    @Test
    @DisplayName("TC_LOGINCRTL_001: Đăng nhập thành công với credentials hợp lệ")
    void testLoginSuccess() throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("hyank23", "sugoi123");
        when(authService.authenticate(any(LoginRequest.class))).thenReturn(mockLoginResponse);

        // Action & Assert
        performPost("/auth/login", loginRequest)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Đăng nhập thành công"))
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.userResponse.id").value(1))
                .andExpect(jsonPath("$.userResponse.username").value("hyank23"))
                .andExpect(jsonPath("$.userResponse.mail").value("hyan123@gmail.com"));
    }

    @Test
    @DisplayName("TC_LOGINCRTL_002: Đăng nhập thất bại khi user không tồn tại")
    void testLoginUserNotFound() throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("unknown", "Secret123");
        when(authService.authenticate(any(LoginRequest.class)))
                .thenThrow(new NotFoundException("Tài khoản hoặc mật khẩu không đúng"));

        // Action & Assert
        performPost("/auth/login", loginRequest)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Tài khoản hoặc mật khẩu không đúng"));
    }

    @Test
    @DisplayName("TC_LOGINCRTL_003: Đăng nhập thất bại khi mật khẩu sai")
    void testLoginWrongPassword() throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("hyank23", "Wrong123");
        when(authService.authenticate(any(LoginRequest.class)))
                .thenThrow(new AuthException("Mật khẩu không chính xác", HttpStatus.UNAUTHORIZED));

        // Action & Assert
        performPost("/auth/login", loginRequest)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Mật khẩu không chính xác"));
    }

    @Test
    @DisplayName("TC_LOGINCRTL_004: Lấy người dùng hiện tại thành công với token hợp lệ")
    void testGetCurrentUserSuccess() throws Exception {
        // Arrange
        String authHeader = "Bearer valid-token";
        when(authService.getCurrentUser(eq(authHeader))).thenReturn(mockUserResponse);

        // Action & Assert
        performGet("/auth/me", authHeader)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("hyank23"))
                .andExpect(jsonPath("$.mail").value("hyan123@gmail.com"));
    }

    @Test
    @DisplayName("TC_LOGINCRTL_005: Lỗi khi header xác thực bị thiếu")
    void testGetCurrentUserMissingHeader() throws Exception {
        // Arrange
        when(authService.getCurrentUser(null))
                .thenThrow(new AuthException("Thiếu header xác thực", HttpStatus.UNAUTHORIZED));

        // Action & Assert
        performGet("/auth/me")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Thiếu header xác thực"));
    }

    @Test
    @DisplayName("TC_LOGINCRTL_006: Lỗi khi token không hợp lệ")
    void testGetCurrentUserInvalidToken() throws Exception {
        // Arrange
        String authHeader = "Bearer invalid-token";
        when(authService.getCurrentUser(eq(authHeader)))
                .thenThrow(new AuthException("Token không hợp lệ", HttpStatus.UNAUTHORIZED));

        // Action & Assert
        performGet("/auth/me", authHeader)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Token không hợp lệ"));
    }
}
