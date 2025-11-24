package com.flogin.dto.login;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor

public class LoginRequest {
    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, message = "username tối thiểu 3 kí tự")
    @Size(max = 50, message = "username tối đa 50 kí tự")
    @Pattern(regexp = "^[A-Za-z\\d\\-._]+$", message = "username chỉ chứa a-z, A-Z,0-9,-,.,_")
    private String username;

    @NotBlank(message = "password không được để trống")
    @Size(min = 6, message = "username tối thiểu 6 kí tự")
    @Size(max = 100, message = "username tối đa 100 kí tự")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]+$", message = "password phải có cả chữ và số")
    private String password;
}
