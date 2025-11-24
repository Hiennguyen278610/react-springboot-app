package com.flogin.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data
@Getter
@AllArgsConstructor
@NoArgsConstructor

public class UserResponse {
    private Long id;
    private String username;
    private String mail;
}
