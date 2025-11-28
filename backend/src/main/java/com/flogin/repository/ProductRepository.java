package com.flogin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flogin.entity.Category;
import com.flogin.entity.ProductEntity;

import java.util.List;

public interface ProductRepository extends JpaRepository<ProductEntity, Long> {
    boolean existsByName(String name);
    List<ProductEntity> findByCategory(Category category);
}
