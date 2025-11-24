package com.flogin.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flogin.configuration.RequireAuth;
import com.flogin.dto.user.UserRequest;
import com.flogin.dto.user.UserResponse;
import com.flogin.entity.UserEntity;
import com.flogin.mapper.UserMapper;
import com.flogin.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
@RequireAuth
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserRequest res) {
        UserEntity entity = userService.create(UserMapper.toEntity(res));
        return ResponseEntity.status(HttpStatus.CREATED).body(UserMapper.toResponse(entity));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable long id) {
        return ResponseEntity.ok(UserMapper.toResponse(userService.getById(id)));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll() {
        List<UserResponse> users = new ArrayList<>();
        for (UserEntity user : userService.getAll()) users.add(UserMapper.toResponse(user));
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
