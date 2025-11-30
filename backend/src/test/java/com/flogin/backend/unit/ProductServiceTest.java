package com.flogin.backend.unit;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
// unused Jpa imports removed

import com.flogin.backend.baseFake.BaseFakeProductRepository;
import com.flogin.dto.product.ProductRequest;
import com.flogin.entity.Category;
import com.flogin.entity.ProductEntity;
import com.flogin.exception.ExistsException;
import com.flogin.exception.NotFoundException;
import com.flogin.repository.ProductRepository;
import com.flogin.service.ProductService;

public class ProductServiceTest {

    private ProductService productService;
    private ProductRepository fakeProductRepository;

    // Fake data
    private ProductEntity fakeProduct1;
    private ProductEntity fakeProduct2;
    private List<ProductEntity> fakeProducts;
    private Long nextId = 3L;

    @BeforeEach
    void setUp() {
        fakeProduct1 = ProductEntity.builder()
                .id(1L)
                .name("Điện thoại iPhone 15")
                .price(new BigDecimal("25000000"))
                .quantity(100)
                .description("Điện thoại Apple iPhone 15 promax nhưng toi khong co tien mua")
                .category(Category.DIEN_TU)
                .build();

        fakeProduct2 = ProductEntity.builder()
                .id(2L)
                .name("Áo thun nam")
                .price(new BigDecimal("250000"))
                .quantity(500)
                .description("Áo thun nam cotton cao cấp quặc không")
                .category(Category.THOI_TRANG)
                .build();

        fakeProducts = new ArrayList<>();
        fakeProducts.add(fakeProduct1);
        fakeProducts.add(fakeProduct2);

        fakeProductRepository = new BaseFakeProductRepository() {
            @Override
            public boolean existsByName(String name) {
                return fakeProducts.stream().anyMatch(p -> p.getName().equals(name));
            }

            @Override
            public List<ProductEntity> findByCategory(Category category) {
                List<ProductEntity> result = new ArrayList<>();
                for (ProductEntity p : fakeProducts) {
                    if (p.getCategory() == category) {
                        result.add(p);
                    }
                }
                return result;
            }

            @Override
            public <S extends ProductEntity> S save(S entity) {
                if (entity.getId() == null) {
                    entity.setId(nextId++);
                    fakeProducts.add(entity);
                } else {
                    fakeProducts.removeIf(p -> p.getId().equals(entity.getId()));
                    fakeProducts.add(entity);
                }
                return entity;
            }

            @Override
            public Optional<ProductEntity> findById(Long id) {
                for (ProductEntity p : fakeProducts) {
                    if (p.getId().equals(id)) return Optional.of(p);
                }
                return Optional.empty();
            }

            @Override
            public List<ProductEntity> findAll() {
                return new ArrayList<>(fakeProducts);
            }

            @Override
            public void delete(ProductEntity entity) {
                fakeProducts.removeIf(p -> p.getId().equals(entity.getId()));
            }
        };

        productService = new ProductService(fakeProductRepository);
    }


    @Test
    @DisplayName("TC_PRODUCT_001: Tạo sản phẩm thành công với dữ liệu hợp lệ")
    void testCreateSuccess() {
        // Arrange
        ProductRequest request = new ProductRequest(
                "Laptop Dell XPS 15",
                new BigDecimal("35000000"),
                50,
                "Laptop cao cấp Dell XPS 15",
                Category.DIEN_TU
        );

        // Action
        ProductEntity result = productService.create(request);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getId());
        assertEquals("Laptop Dell XPS 15", result.getName());
        assertEquals(new BigDecimal("35000000"), result.getPrice());
        assertEquals(50, result.getQuantity());
        assertEquals(Category.DIEN_TU, result.getCategory());
    }

    @Test
    @DisplayName("TC_PRODUCT_002: Tạo sản phẩm thất bại khi tên đã tồn tại")
    void testCreateFailNameExists() {
        // Arrange
        ProductRequest request = new ProductRequest(
                "Điện thoại iPhone 15",
                new BigDecimal("26000000"),
                50,
                "Điện thoại mới",
                Category.DIEN_TU
        );

        // Action
        ExistsException exception = assertThrows(ExistsException.class, () -> {
            productService.create(request);
        });
        
        // Assert
        assertEquals("Tên sản phẩm đã tồn tại", exception.getMessage());
    }

    @Test
    @DisplayName("TC_PRODUCT_003: Lấy tất cả sản phẩm thành công")
    void testGetAllSuccess() {
        // Action
        List<ProductEntity> result = productService.getAll();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("TC_PRODUCT_004: Lấy sản phẩm theo ID thành công")
    void testGetByIdSuccess() {
        // Action
        ProductEntity result = productService.getById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Điện thoại iPhone 15", result.getName());
    }

    @Test
    @DisplayName("TC_PRODUCT_005: Lấy sản phẩm thất bại khi ID không tồn tại")
    void testGetByIdNotFound() {
        // Action 
        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            productService.getById(999L);
        });
        // Assert
        assertEquals("Sản phẩm không tồn tại", exception.getMessage());
    }

    @Test
    @DisplayName("TC_PRODUCT_006: Lấy sản phẩm theo danh mục thành công")
    void testGetByCategorySuccess() {
        // Action
        List<ProductEntity> result = productService.getByCategory(Category.DIEN_TU);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Điện thoại iPhone 15", result.get(0).getName());
    }


    @Test
    @DisplayName("TC_PRODUCT_007: Xóa sản phẩm thành công")
    void testDeleteSuccess() {
        // Arrange
        int initialSize = fakeProducts.size();

        // Action
        productService.delete(1L);

        // Assert
        assertEquals(initialSize - 1, fakeProducts.size());
        assertFalse(fakeProducts.stream().anyMatch(p -> p.getId().equals(1L)));
    }


    @Test
    @DisplayName("TC_PRODUCT_008: Xóa sản phẩm thất bại khi ID không tồn tại")
    void testDeleteNotFound() {
        // Action 
        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            productService.delete(999L);
        });
        // Assert
        assertEquals("Sản phẩm không tồn tại", exception.getMessage());
    }

    @Test
    @DisplayName("TC_PRODUCT_009: Cập nhật sản phẩm thành công")
    void testUpdateSuccess() {
        // Arrange
        ProductRequest request = new ProductRequest(
                "Điện thoại iPhone 15 Pro Max",
                new BigDecimal("30000000"),
                80,
                "Phiên bản nâng cấp",
                Category.DIEN_TU
        );

        // Action
        ProductEntity result = productService.update(1L, request);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Điện thoại iPhone 15 Pro Max", result.getName());
        assertEquals(new BigDecimal("30000000"), result.getPrice());
        assertEquals(80, result.getQuantity());
    }

    @Test
    @DisplayName("TC_PRODUCT_010: Cập nhật sản phẩm thất bại khi ID không tồn tại")
    void testUpdateNotFound() {
        // Arrange
        ProductRequest request = new ProductRequest(
                "Sản phẩm mới",
                new BigDecimal("100000"),
                10,
                "Mô tả",
                Category.KHAC
        );

        // Action 
        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            productService.update(999L, request);
        });
        // Assert
        assertEquals("Sản phẩm không tồn tại", exception.getMessage());
    }
}
