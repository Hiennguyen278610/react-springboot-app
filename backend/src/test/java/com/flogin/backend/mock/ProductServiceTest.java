package com.flogin.backend.mock;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.flogin.dto.product.ProductRequest;
import com.flogin.entity.Category;
import com.flogin.entity.ProductEntity;
import com.flogin.exception.ExistsException;
import com.flogin.exception.NotFoundException;
import com.flogin.repository.ProductRepository;
import com.flogin.service.ProductService;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {
    @Mock
    private ProductRepository productRepository;
    @InjectMocks
    private ProductService productService;
    private ProductEntity mockProduct1;
    private ProductEntity mockProduct2;

    @BeforeEach
    void setUp() {
        mockProduct1 = ProductEntity.builder()
                .id(1L)
                .name("Điện thoại iPhone 15")
                .price(new BigDecimal("25000000"))
                .quantity(100)
                .description("Điện thoại Apple iPhone 15 promax nhưng toi khong co tien mua")
                .category(Category.DIEN_TU)
                .build();

        mockProduct2 = ProductEntity.builder()
                .id(2L)
                .name("Áo thun nam")
                .price(new BigDecimal("250000"))
                .quantity(500)
                .description("Áo thun nam cotton cao cấp quặc không")
                .category(Category.THOI_TRANG)
                .build();
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
        ProductEntity savedProduct = ProductEntity.builder()
                .id(3L)
                .name("Laptop Dell XPS 15")
                .price(new BigDecimal("35000000"))
                .quantity(50)
                .description("Laptop cao cấp Dell XPS 15")
                .category(Category.DIEN_TU)
                .build();

        when(productRepository.existsByName("Laptop Dell XPS 15")).thenReturn(false);
        when(productRepository.save(any(ProductEntity.class))).thenReturn(savedProduct);

        // Action
        ProductEntity result = productService.create(request);

        // Assert
        assertNotNull(result);
        assertEquals(3L, result.getId());
        assertEquals("Laptop Dell XPS 15", result.getName());
        assertEquals(new BigDecimal("35000000"), result.getPrice());
        assertEquals(50, result.getQuantity());
        assertEquals(Category.DIEN_TU, result.getCategory());

        verify(productRepository).existsByName("Laptop Dell XPS 15");
        verify(productRepository).save(any(ProductEntity.class));
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
        when(productRepository.existsByName("Điện thoại iPhone 15")).thenReturn(true);

        // Action
        ExistsException exception = assertThrows(ExistsException.class, () -> {
            productService.create(request);
        });

        // Assert
        assertEquals("Tên sản phẩm đã tồn tại", exception.getMessage());
        verify(productRepository).existsByName("Điện thoại iPhone 15");
        verify(productRepository, never()).save(any(ProductEntity.class));
    }

    @Test
    @DisplayName("TC_PRODUCT_003: Lấy tất cả sản phẩm thành công")
    void testGetAllSuccess() {
        // Arrange
        List<ProductEntity> products = new ArrayList<>();
        products.add(mockProduct1);
        products.add(mockProduct2);
        when(productRepository.findAll()).thenReturn(products);

        // Action
        List<ProductEntity> result = productService.getAll();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(productRepository).findAll();
    }

    @Test
    @DisplayName("TC_PRODUCT_004: Lấy sản phẩm theo ID thành công")
    void testGetByIdSuccess() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct1));

        // Action
        ProductEntity result = productService.getById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Điện thoại iPhone 15", result.getName());
        verify(productRepository).findById(1L);
    }

    @Test
    @DisplayName("TC_PRODUCT_005: Lấy sản phẩm thất bại khi ID không tồn tại")
    void testGetByIdNotFound() {
        // Arrange
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // Action
        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            productService.getById(999L);
        });

        // Assert
        assertEquals("Sản phẩm không tồn tại", exception.getMessage());
        verify(productRepository).findById(999L);
    }

    @Test
    @DisplayName("TC_PRODUCT_006: Lấy sản phẩm theo danh mục thành công")
    void testGetByCategorySuccess() {
        // Arrange
        List<ProductEntity> dienTuProducts = new ArrayList<>();
        dienTuProducts.add(mockProduct1);
        when(productRepository.findByCategory(Category.DIEN_TU)).thenReturn(dienTuProducts);

        // Action
        List<ProductEntity> result = productService.getByCategory(Category.DIEN_TU);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Điện thoại iPhone 15", result.get(0).getName());
        verify(productRepository).findByCategory(Category.DIEN_TU);
    }

    @Test
    @DisplayName("TC_PRODUCT_007: Xóa sản phẩm thành công")
    void testDeleteSuccess() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct1));
        doNothing().when(productRepository).delete(mockProduct1);

        // Action
        productService.delete(1L);

        // Assert
        verify(productRepository).findById(1L);
        verify(productRepository).delete(mockProduct1);
    }

    @Test
    @DisplayName("TC_PRODUCT_008: Xóa sản phẩm thất bại khi ID không tồn tại")
    void testDeleteNotFound() {
        // Arrange
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // Action
        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            productService.delete(999L);
        });

        // Assert
        assertEquals("Sản phẩm không tồn tại", exception.getMessage());
        verify(productRepository).findById(999L);
        verify(productRepository, never()).delete(any(ProductEntity.class));
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
        ProductEntity existingProduct = ProductEntity.builder()
                .id(1L)
                .name("Điện thoại iPhone 15")
                .price(new BigDecimal("25000000"))
                .quantity(100)
                .description("Điện thoại Apple iPhone 15")
                .category(Category.DIEN_TU)
                .build();
        ProductEntity updatedProduct = ProductEntity.builder()
                .id(1L)
                .name("Điện thoại iPhone 15 Pro Max")
                .price(new BigDecimal("30000000"))
                .quantity(80)
                .description("Phiên bản nâng cấp")
                .category(Category.DIEN_TU)
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(existingProduct));
        when(productRepository.existsByName("Điện thoại iPhone 15 Pro Max")).thenReturn(false);
        when(productRepository.save(any(ProductEntity.class))).thenReturn(updatedProduct);

        // Action
        ProductEntity result = productService.update(1L, request);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Điện thoại iPhone 15 Pro Max", result.getName());
        assertEquals(new BigDecimal("30000000"), result.getPrice());
        assertEquals(80, result.getQuantity());

        verify(productRepository).findById(1L);
        verify(productRepository).existsByName("Điện thoại iPhone 15 Pro Max");
        verify(productRepository).save(any(ProductEntity.class));
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
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // Action
        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            productService.update(999L, request);
        });

        // Assert
        assertEquals("Sản phẩm không tồn tại", exception.getMessage());
        verify(productRepository).findById(999L);
        verify(productRepository, never()).save(any(ProductEntity.class));
    }
}
