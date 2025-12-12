package com.flogin.backend.mock;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;

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
import org.springframework.web.client.HttpClientErrorException.NotFound;

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
		LoginRequest req = new LoginRequest(mockUser.getUsername(), "sugoi");
		when(userRepository.findByUsername(mockUser.getUsername())).thenReturn(Optional.of(mockUser));
		when(passwordEncoder.matches("sugoi", mockUser.getPassword())).thenReturn(true);
		when(jwtTokenProvider.generateToken(mockUser.getUsername())).thenReturn("jwt-token");

		LoginResponse res = authService.authenticate(req);

		assertEquals(req.getUsername(), res.getUserResponse().getUsername());

		verify(userRepository).findByUsername(mockUser.getUsername());
		verify(passwordEncoder).matches("sugoi", mockUser.getPassword());
		verify(jwtTokenProvider).generateToken(mockUser.getUsername());
	}

	@Test
	@DisplayName("TC_LOGIN_002: Đăng nhập thất bại khi user không tồn tại")
	void testAuthUserNotFound() {
		LoginRequest req = new LoginRequest("haha", "123");
		when(userRepository.findByUsername("haha")).thenReturn(Optional.empty());

		NotFoundException ex = assertThrows(NotFoundException.class, 
			() -> authService.authenticate(req)
		);

		assertEquals("Tài khoản hoặc mật khẩu không đúng", ex.getMessage());
		verify(userRepository).findByUsername("haha");
	}

	@Test
	@DisplayName("TC_LOGIN_003: Đăng nhập thất bại khi mật khẩu sai")
	void testAuthWrongPassword() {
		LoginRequest req = new LoginRequest(mockUser.getUsername(), "123");
		when(userRepository.findByUsername(mockUser.getUsername())).thenReturn(Optional.of(mockUser));
		when(passwordEncoder.matches("123", mockUser.getPassword())).thenReturn(false);
		AuthException ex = assertThrows(AuthException.class, () -> authService.authenticate(req));
		
		assertEquals("Mật khẩu không chính xác", ex.getMessage());
		verify(userRepository).findByUsername(mockUser.getUsername());
		verify(passwordEncoder).matches("123", mockUser.getPassword());
	}

	@Test
	@DisplayName("TC_LOGIN_004: Lấy người dùng hiện tại thành công với token hợp lệ")
	void testGetCurrentUserSuccess() {
		String token = "jwt-token";
		when(jwtTokenProvider.validateToken(token)).thenReturn(true);
		when(jwtTokenProvider.getUsernameFromToken(token)).thenReturn(mockUser.getUsername());
		when(userRepository.findByUsername(mockUser.getUsername())).thenReturn(Optional.of(mockUser));

		UserResponse user = authService.getCurrentUser("Bearer " + token);

		assertEquals(user.getUsername(), mockUser.getUsername());
		verify(jwtTokenProvider).validateToken(token);
		verify(jwtTokenProvider).getUsernameFromToken(token);
		verify(userRepository).findByUsername(user.getUsername());
	}

	@Test
	@DisplayName("TC_LOGIN_005: Lỗi khi header xác thực bị thiếu")
	void testGetCurrentUserHeaderNull() {
		
		AuthException ex = assertThrows(AuthException.class, () -> authService.getCurrentUser(null));

		assertEquals("Thiếu header xác thực", ex.getMessage());

	}

	@Test
	@DisplayName("TC_LOGIN_006: Lỗi khi header không đúng định dạng")
	void testGetCurrentUserHeaderInvalidPrefix() {
		String token = "sugoi heheh";
		AuthException ex = assertThrows(AuthException.class, () -> authService.getCurrentUser(token));
		assertEquals("Thiếu header xác thực", ex.getMessage());
	}
}
