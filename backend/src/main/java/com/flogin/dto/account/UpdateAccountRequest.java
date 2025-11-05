package com.flogin.dto.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter

public class UpdateAccountRequest {
    @NotBlank(message = "password không được để trống")
    @Size(min = 6, max = 100, message = "password phải từ 6-100 kí tự")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]+$", message = "password phải có cả chữ và số")
    private String password;
}
