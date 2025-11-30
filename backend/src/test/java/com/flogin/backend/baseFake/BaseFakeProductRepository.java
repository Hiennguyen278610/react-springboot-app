package com.flogin.backend.baseFake;

import java.util.List;
import java.util.Optional;

import com.flogin.entity.Category;
import com.flogin.entity.ProductEntity;
import com.flogin.repository.ProductRepository;

public class BaseFakeProductRepository implements ProductRepository {
    @Override
    public boolean existsByName(String name) {
        return false;
    }

    @Override
    public List<ProductEntity> findByCategory(Category category) {
        return List.of();
    }

    @Override
    public void flush() {
    }

    @Override
    public <S extends ProductEntity> S saveAndFlush(S entity) {
        return entity;
    }

    @Override
    public <S extends ProductEntity> List<S> saveAllAndFlush(Iterable<S> entities) {
        return null;
    }

    @Override
    public void deleteAllInBatch(Iterable<ProductEntity> entities) {
    }

    @Override
    public void deleteAllByIdInBatch(Iterable<Long> longs) {
    }

    @Override
    public void deleteAllInBatch() {
    }

    @Override
    public ProductEntity getOne(Long aLong) {
        return null;
    }

    @Override
    public ProductEntity getById(Long aLong) {
        return null;
    }

    @Override
    public ProductEntity getReferenceById(Long aLong) {
        return null;
    }

    @Override
    public <S extends ProductEntity> List<S> findAll(org.springframework.data.domain.Example<S> example) {
        return null;
    }

    @Override
    public <S extends ProductEntity> List<S> findAll(org.springframework.data.domain.Example<S> example,
            org.springframework.data.domain.Sort sort) {
        return null;
    }

    @Override
    public <S extends ProductEntity> List<S> saveAll(Iterable<S> entities) {
        return null;
    }

    @Override
    public List<ProductEntity> findAll() {
        return null;
    }

    @Override
    public List<ProductEntity> findAllById(Iterable<Long> longs) {
        return null;
    }

    @Override
    public <S extends ProductEntity> S save(S entity) {
        return entity;
    }

    @Override
    public Optional<ProductEntity> findById(Long aLong) {
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
    public void delete(ProductEntity entity) {
    }

    @Override
    public void deleteAllById(Iterable<? extends Long> longs) {
    }

    @Override
    public void deleteAll(Iterable<? extends ProductEntity> entities) {
    }

    @Override
    public void deleteAll() {
    }

    @Override
    public List<ProductEntity> findAll(org.springframework.data.domain.Sort sort) {
        return null;
    }

    @Override
    public org.springframework.data.domain.Page<ProductEntity> findAll(org.springframework.data.domain.Pageable pageable) {
        return null;
    }

    @Override
    public <S extends ProductEntity> Optional<S> findOne(org.springframework.data.domain.Example<S> example) {
        return Optional.empty();
    }

    @Override
    public <S extends ProductEntity> org.springframework.data.domain.Page<S> findAll(
            org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Pageable pageable) {
        return null;
    }

    @Override
    public <S extends ProductEntity> long count(org.springframework.data.domain.Example<S> example) {
        return 0;
    }

    @Override
    public <S extends ProductEntity> boolean exists(org.springframework.data.domain.Example<S> example) {
        return false;
    }

    @Override
    public <S extends ProductEntity, R> R findBy(org.springframework.data.domain.Example<S> example,
            java.util.function.Function<org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery<S>, R> queryFunction) {
        return null;
    }
}
