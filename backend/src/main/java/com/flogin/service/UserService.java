package com.flogin.service;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.flogin.entity.UserEntity;
import com.flogin.exception.ExistsException;
import com.flogin.exception.NotFoundException;
import com.flogin.repository.UserRepository;

@Service
@RequiredArgsConstructor

public class UserService {
    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;

    public UserEntity create(UserEntity user) {
        if (repo.existsByUsername(user.getUsername())) 
            throw new ExistsException("Username đã tồn tại");
        if (repo.existsByMail(user.getMail()))
            throw new ExistsException("Email đã được sử dụng");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return repo.save(user);
    }

    public List<UserEntity> getAll() {
        return repo.findAll();
    }

    public UserEntity getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("Tài khoản không tồn tại"));
    }

    public UserEntity getByUsername (String username) {
        return repo.findByUsername(username).orElseThrow(() -> new NotFoundException("Tài khoản không đúng"));
    }

    public UserEntity update(Long id, UserEntity user) {
        UserEntity result = getById(id);
        result.setPassword(passwordEncoder.encode(user.getPassword()));
        result.setMail(user.getMail());
        return repo.save(result);
    }

    public void delete(Long id) {
        repo.delete(getById(id));
    }
}