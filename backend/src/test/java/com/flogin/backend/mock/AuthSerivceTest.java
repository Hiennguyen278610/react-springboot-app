package com.flogin.backend.mock;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.flogin.configuration.JwtTokenProvider;
import com.flogin.dto.login.LoginRequest;
import com.flogin.dto.login.LoginResponse;
import com.flogin.dto.user.UserResponse;
import com.flogin.entity.UserEntity;
import com.flogin.exception.AuthException;
import com.flogin.exception.NotFoundException;
import com.flogin.repository.UserRepository;
import com.flogin.service.AuthService;

import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
public class AuthSerivceTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private JwtTokenProvider jwtTokenProvider;

	@InjectMocks
	private AuthService authService;

	private UserEntity mockUser;

	@BeforeEach
	void setUpMockUser() {
		mockUser = UserEntity.builder()
				.id(1L)
				.username("hyank23")
				.password("encodedPassword")
				.mail("hyan123@gmail.com")
				.build();

		lenient().when(userRepository.findByUsername("hyank23")).thenReturn(Optional.of(mockUser));
		lenient().when(passwordEncoder.matches("sugoi123", "encodedPassword")).thenReturn(true);
		lenient().when(jwtTokenProvider.generateToken("hyank23")).thenReturn("jwt-token");
	}

	@Test
	@DisplayName("TC_LOGIN_001: Đăng nhập thành công với credentials hợp lệ")
	void testLoginSuccess() {
		// Arrange
		LoginRequest loginRequest = new LoginRequest("hyank23", "sugoi123");
		when(userRepository.findByUsername("hyank23")).thenReturn(Optional.of(mockUser));
		when(passwordEncoder.matches("sugoi123", "encodedPassword")).thenReturn(true);
		when(jwtTokenProvider.generateToken("hyank23")).thenReturn("jwt-token");

		// Action
		LoginResponse response = authService.authenticate(loginRequest);

		// Assert
		assertTrue(response.isSuccess());
		assertEquals("Đăng nhập thành công", response.getMessage());
		assertEquals("jwt-token", response.getToken());
		assertEquals(new UserResponse(1L, "hyank23", "hyan123@gmail.com"), response.getUserResponse());

		verify(userRepository).findByUsername("hyank23");
		verify(passwordEncoder).matches("sugoi123", "encodedPassword");
		verify(jwtTokenProvider).generateToken("hyank23");
	}

	@Test
	@DisplayName("TC_LOGIN_002: Đăng nhập thất bại khi user không tồn tại")
	void testAuthUserNotFound() {
		// Arrange
		LoginRequest loginRequest = new LoginRequest("unknown", "Secret123");
		when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

		// Action
		NotFoundException exception = assertThrows(NotFoundException.class,
				() -> authService.authenticate(loginRequest));

		// Assert
		assertEquals("Tài khoản hoặc mật khẩu không đúng", exception.getMessage());
		verify(userRepository).findByUsername("unknown");
	}

	@Test
	@DisplayName("TC_LOGIN_003: Đăng nhập thất bại khi mật khẩu sai")
	void testAuthWrongPassword() {
		// Arrange
		LoginRequest loginRequest = new LoginRequest("hyank23", "Wrong123");
		UserEntity persistedUser = mockUser;
		when(userRepository.findByUsername("hyank23")).thenReturn(Optional.of(persistedUser));
		when(passwordEncoder.matches("Wrong123", "encodedPassword")).thenReturn(false);

		// Action
		AuthException exception = assertThrows(AuthException.class,
				() -> authService.authenticate(loginRequest));

		// Assert
		assertEquals("Mật khẩu không chính xác", exception.getMessage());
		assertEquals(HttpStatus.UNAUTHORIZED, exception.geHttpStatus());
		verify(userRepository).findByUsername("hyank23");
		verify(passwordEncoder).matches("Wrong123", "encodedPassword");
	}

	@Test
	@DisplayName("TC_LOGIN_004: Lấy người dùng hiện tại thành công với token hợp lệ")
	void testGetCurrentUserSuccess() {
		// Arrange
		String authorizationHeader = "Bearer valid-token";
		UserEntity persistedUser = mockUser;
		when(jwtTokenProvider.validateToken("valid-token")).thenReturn(true);
		when(jwtTokenProvider.getUsernameFromToken("valid-token")).thenReturn("hyank23");
		when(userRepository.findByUsername("hyank23")).thenReturn(Optional.of(persistedUser));

		// Action
		UserResponse response = authService.getCurrentUser(authorizationHeader);

		// Assert
		assertEquals(new UserResponse(1L, "hyank23", "hyan123@gmail.com"), response);
		verify(jwtTokenProvider).validateToken("valid-token");
		verify(jwtTokenProvider).getUsernameFromToken("valid-token");
		verify(userRepository).findByUsername("hyank23");
	}

	@Test
	@DisplayName("TC_LOGIN_005: Lỗi khi header xác thực bị thiếu")
	void testGetCurrentUserHeaderNull() {
		// Arrange
		String authorizationHeader = null;

		// Action
		AuthException exception = assertThrows(AuthException.class,
				() -> authService.getCurrentUser(authorizationHeader));

		// Assert
		assertEquals("Thiếu header xác thực", exception.getMessage());
		assertEquals(HttpStatus.UNAUTHORIZED, exception.geHttpStatus());
	}

	@Test
	@DisplayName("TC_LOGIN_006: Lỗi khi header không đúng định dạng")
	void testGetCurrentUserHeaderInvalidPrefix() {
		// Arrange
		String authorizationHeader = "Token sairoihaha";

		// Action
		AuthException exception = assertThrows(AuthException.class,
				() -> authService.getCurrentUser(authorizationHeader));

		// Assert
		assertEquals("Thiếu header xác thực", exception.getMessage());
		assertEquals(HttpStatus.UNAUTHORIZED, exception.geHttpStatus());
	}
}
