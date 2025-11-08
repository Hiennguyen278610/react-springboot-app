package com.flogin.mapper;

import java.util.List;

import com.flogin.dto.user.CreateUserRequest;
import com.flogin.dto.user.UpdateUserRequest;
import com.flogin.dto.user.UserResponse;
import com.flogin.entity.User;

public class UserMapper {
    public static User toEntity(CreateUserRequest req) {
        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(req.getPassword());
        return user;
    }    
    
    public static User toEntity(UpdateUserRequest req) {
        User user = new User();
        user.setPassword(req.getPassword());
        return user;
    }

    public static UserResponse toResponse(User user) {
        return new UserResponse(
                user.getUsername(),
                user.getMail());
    }

    public static List<UserResponse> toResponses(List<User> users) {
        return users.stream().map(UserMapper::toResponse).toList();
    }
}