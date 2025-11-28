package com.flogin.dto.product;

import com.flogin.entity.Category;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Getter
@AllArgsConstructor
@NoArgsConstructor

public class ProductResponse {
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer quantity;
    private String description;
    private Category category;
}
