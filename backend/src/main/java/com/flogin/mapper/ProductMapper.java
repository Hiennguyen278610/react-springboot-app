package com.flogin.mapper;

import com.flogin.dto.product.ProductRequest;
import com.flogin.dto.product.ProductResponse;
import com.flogin.entity.ProductEntity;

public class ProductMapper {
    public static ProductEntity toEntity(ProductRequest req) {
        return ProductEntity.builder()
                .name(req.getName())
                .price(req.getPrice())
                .quantity(req.getQuantity())
                .description(req.getDescription())
                .category(req.getCategory())
                .build();
    }

    public static ProductResponse toResponse(ProductEntity product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getQuantity(),
                product.getDescription(),
                product.getCategory()
        );
    }

    public static void updateEntity(ProductEntity entity, ProductRequest req) {
        entity.setName(req.getName());
        entity.setPrice(req.getPrice());
        entity.setQuantity(req.getQuantity());
        entity.setDescription(req.getDescription());
        entity.setCategory(req.getCategory());
    }
}
