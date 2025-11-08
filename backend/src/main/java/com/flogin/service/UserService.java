package com.flogin.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.flogin.entity.User;
import com.flogin.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository repo;

    public User create(User user) {
        if (repo.existsByUsername(user.getUsername())) 
            throw new RuntimeException("Username đã tồn tại");
        return repo.save(user);
    }

    public List<User> getAll() {
        return repo.findAll();
    }

    public User getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
    }

    public User update(Long id, User user) {
        User result = getById(id);
        result.setPassword(user.getPassword());
        return repo.save(result);
    }

    public void delete(Long id) {
        repo.delete(getById(id));
    }
}
