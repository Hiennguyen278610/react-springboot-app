package com.flogin.backend.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flogin.BackendApplication;
import com.flogin.dto.login.LoginRequest;
import com.flogin.entity.UserEntity;
import com.flogin.repository.UserRepository;
import com.flogin.service.UserService;

import jakarta.transaction.Transactional;

@SpringBootTest(classes = BackendApplication.class)
@AutoConfigureMockMvc
@Transactional
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    private UserEntity testUser;

    private String originUrl = "Access-Control-Allow-Origin";
    private String originCredentials = "Access-Control-Allow-Credentials";

    @BeforeEach
    void setUp() {
        testUser = new UserEntity();
        testUser.setUsername("Hyan2005");
        testUser.setPassword("sugoi123");
        testUser.setMail("hyan123@gmail.com");
        testUser = userService.create(testUser);
    }

    @AfterEach
    void cleanTest() {
        if (testUser != null)
            userRepository.delete(testUser);
    }

    private ResultActions performPost(String api, Object requestBody) throws Exception {
        return mockMvc.perform(post(api)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody)));
    }

    @Test
    @Tag("critical")
    @DisplayName("TC_LOGIN_001: Đăng nhập thành công với credentials hợp lệ")
    void testLoginSuccess() throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("Hyan2005", "sugoi123");

        // Action
        ResultActions action = performPost("/auth/login", loginRequest);

        // Assert
        action.andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Đăng nhập thành công"))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.userResponse.username").value("Hyan2005"))
                .andExpect(jsonPath("$.userResponse.mail").value("hyan123@gmail.com"));
    }

    @Test
    @Tag("critical")
    @DisplayName("TC_LOGIN_002: Đăng nhập thất bại với mật khẩu sai")
    void testLoginFailWrongPassword() throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("Hyan2005", "password123");

        // Action
        ResultActions action = performPost("/auth/login", loginRequest);

        // Assert
        action.andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Mật khẩu không chính xác"));
    }

    @Test
    @Tag("critical")
    @DisplayName("TC_LOGIN_003: Đăng nhập thất bại với tên đăng nhập không tồn tại")
    void testLoginFailNonExistentUsername() throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("null123", "sugoi123");

        // Action
        ResultActions action = performPost("/auth/login", loginRequest);

        // Assert
        action.andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Tài khoản hoặc mật khẩu không đúng"));
    }

    @Test
    @Tag("critical")
    @DisplayName("TC_LOGIN_004: Đăng nhập thất bại với username rỗng")
    void testLoginFailEmptyUsername() throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("", "sugoi123");

        // Action
        ResultActions action = performPost("/auth/login", loginRequest);

        // Assert
        action.andExpect(status().isBadRequest());
    }

    @Test
    @Tag("critical")
    @DisplayName("TC_LOGIN_005: Đăng nhập thất bại với password rỗng")
    void testLoginFailEmptyPassword() throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest("Hyan2005", "");

        // Action
        ResultActions action = performPost("/auth/login", loginRequest);

        // Assert
        action.andExpect(status().isBadRequest());
    }

    @Test
    @Tag("high")
    @DisplayName("TC_LOGIN_006: Kiểm tra CORS headers với GET /auth/me endpoint")
    void testCorsHeadersOnGetCurrentUser() throws Exception {
        // Arrange
        String origin = "http://localhost:3000";
        LoginRequest loginRequest = new LoginRequest("Hyan2005", "sugoi123");
        String response = performPost("/auth/login", loginRequest).andReturn().getResponse().getContentAsString();
        String token = objectMapper.readTree(response).get("token").asText();

        // Action
        ResultActions action = mockMvc.perform(get("/auth/me")
                .header("Authorization", "Bearer " + token)
                .header("Origin", origin));

        // Assert
        action.andExpect(status().isOk())
                .andExpect(header().string(originUrl, origin))
                .andExpect(header().string(originCredentials, "true"));
    }

}
