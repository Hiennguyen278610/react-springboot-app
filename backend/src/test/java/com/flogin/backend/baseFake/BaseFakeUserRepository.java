package com.flogin.backend.baseFake;

import java.util.Optional;

import com.flogin.entity.UserEntity;
import com.flogin.repository.UserRepository;

public class BaseFakeUserRepository implements UserRepository {
    @Override
    public boolean existsByMail(String email) {
        return "testuser@example.com".equals(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return "testuser".equals(username);
    }

    @Override
    public Optional<UserEntity> findByUsername(String username) {
        return Optional.empty();
    }

    @Override
    public void flush() {
    }

    @Override
    public <S extends UserEntity> S saveAndFlush(S entity) {
        return entity;
    }

    @Override
    public <S extends UserEntity> java.util.List<S> saveAllAndFlush(Iterable<S> entities) {
        return null;
    }

    @Override
    public void deleteAllInBatch(Iterable<UserEntity> entities) {
    }

    @Override
    public void deleteAllByIdInBatch(Iterable<Long> longs) {
    }

    @Override
    public void deleteAllInBatch() {
    }

    @Override
    public UserEntity getOne(Long aLong) {
        return null;
    }

    @Override
    public UserEntity getById(Long aLong) {
        return null;
    }

    @Override
    public UserEntity getReferenceById(Long aLong) {
        return null;
    }

    @Override
    public <S extends UserEntity> java.util.List<S> findAll(org.springframework.data.domain.Example<S> example) {
        return null;
    }

    @Override
    public <S extends UserEntity> java.util.List<S> findAll(org.springframework.data.domain.Example<S> example,
            org.springframework.data.domain.Sort sort) {
        return null;
    }

    @Override
    public <S extends UserEntity> java.util.List<S> saveAll(Iterable<S> entities) {
        return null;
    }

    @Override
    public java.util.List<UserEntity> findAll() {
        return null;
    }

    @Override
    public java.util.List<UserEntity> findAllById(Iterable<Long> longs) {
        return null;
    }

    @Override
    public <S extends UserEntity> S save(S entity) {
        return entity;
    }

    @Override
    public Optional<UserEntity> findById(Long aLong) {
        return Optional.empty();
    }

    @Override
    public boolean existsById(Long aLong) {
        return false;
    }

    @Override
    public long count() {
        return 0;
    }

    @Override
    public void deleteById(Long aLong) {
    }

    @Override
    public void delete(UserEntity entity) {
    }

    @Override
    public void deleteAllById(Iterable<? extends Long> longs) {
    }

    @Override
    public void deleteAll(Iterable<? extends UserEntity> entities) {
    }

    @Override
    public void deleteAll() {
    }

    @Override
    public java.util.List<UserEntity> findAll(org.springframework.data.domain.Sort sort) {
        return null;
    }

    @Override
    public org.springframework.data.domain.Page<UserEntity> findAll(org.springframework.data.domain.Pageable pageable) {
        return null;
    }

    @Override
    public <S extends UserEntity> Optional<S> findOne(org.springframework.data.domain.Example<S> example) {
        return Optional.empty();
    }

    @Override
    public <S extends UserEntity> org.springframework.data.domain.Page<S> findAll(
            org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Pageable pageable) {
        return null;
    }

    @Override
    public <S extends UserEntity> long count(org.springframework.data.domain.Example<S> example) {
        return 0;
    }

    @Override
    public <S extends UserEntity> boolean exists(org.springframework.data.domain.Example<S> example) {
        return false;
    }

    @Override
    public <S extends UserEntity, R> R findBy(org.springframework.data.domain.Example<S> example,
            java.util.function.Function<org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery<S>, R> queryFunction) {
        return null;
    }
}
