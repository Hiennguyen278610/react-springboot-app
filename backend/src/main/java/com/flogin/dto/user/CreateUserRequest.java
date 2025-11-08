package com.flogin.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter

public class CreateUserRequest {
    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 50, message = "username phải từ 3-50 kí tự")
    @Pattern(regexp = "^[A-Za-z\\d\\-._]+$", message = "username chỉ chứa a-z, A-Z,0-9,-,.,_")
    private String username;

    @NotBlank(message = "password không được để trống")
    @Size(min = 6, max = 100, message = "password phải từ 6-100 kí tự")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]+$", message = "password phải có cả chữ và số")
    private String password;
}