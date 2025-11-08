package com.flogin.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flogin.dto.user.CreateUserRequest;
import com.flogin.dto.user.UpdateUserRequest;
import com.flogin.dto.user.UserResponse;
import com.flogin.entity.User;
import com.flogin.mapper.UserMapper;
import com.flogin.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/backend/api/users")

public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
        User entity = userService.create(UserMapper.toEntity(req));
        UserResponse res = UserMapper.toResponse(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll() {
        return ResponseEntity.ok(UserMapper.toResponses(userService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById (@PathVariable Long id) {
        return ResponseEntity.ok(UserMapper.toResponse(userService.getById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest req) { 
        return ResponseEntity.ok(UserMapper.toResponse(userService.update(id, UserMapper.toEntity(req))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
