package com.flogin.service;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.flogin.dto.product.ProductRequest;
import com.flogin.entity.Category;
import com.flogin.entity.ProductEntity;
import com.flogin.exception.ExistsException;
import com.flogin.exception.NotFoundException;
import com.flogin.mapper.ProductMapper;
import com.flogin.repository.ProductRepository;

@Service
@RequiredArgsConstructor

public class ProductService {
    private final ProductRepository repo;

    public ProductEntity create(ProductRequest req) {
        if (repo.existsByName(req.getName()))
            throw new ExistsException("Tên sản phẩm đã tồn tại");
        ProductEntity entity = ProductMapper.toEntity(req);
        return repo.save(entity);
    }

    public List<ProductEntity> getAll() {
        return repo.findAll();
    }

    public ProductEntity getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("Sản phẩm không tồn tại"));
    }

    public List<ProductEntity> getByCategory(Category category) {
        return repo.findByCategory(category);
    }

    public ProductEntity update(Long id, ProductRequest req) {
        ProductEntity entity = getById(id);

        if (!entity.getName().equals(req.getName()) && repo.existsByName(req.getName()))
            throw new ExistsException("Tên sản phẩm đã tồn tại");

        ProductMapper.updateEntity(entity, req);
        return repo.save(entity);
    }

    public void delete(Long id) {
        repo.delete(getById(id));
    }
}
