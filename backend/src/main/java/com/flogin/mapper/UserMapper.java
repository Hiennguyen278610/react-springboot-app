package com.flogin.mapper;

import com.flogin.dto.user.UserRequest;
import com.flogin.dto.user.UserResponse;
import com.flogin.entity.UserEntity;

public class UserMapper {
    public static UserEntity toEntity (UserRequest res) {
        return new UserEntity(null, res.getUsername(), res.getPassword(), res.getMail());
    }

    public static UserResponse toResponse (UserEntity user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getMail());
    }
}
