package com.flogin.backend.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flogin.BackendApplication;
import com.flogin.dto.login.LoginRequest;
import com.flogin.dto.product.ProductRequest;
import com.flogin.entity.Category;
import com.flogin.entity.ProductEntity;
import com.flogin.entity.UserEntity;
import com.flogin.repository.ProductRepository;
import com.flogin.repository.UserRepository;
import com.flogin.service.UserService;

import jakarta.transaction.Transactional;

@SpringBootTest(classes = BackendApplication.class)
@AutoConfigureMockMvc
@Transactional
public class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProductRepository productRepository;

    private UserEntity testUser;
    private String authToken;
    private ProductEntity testProduct;

    @BeforeEach
    void setUp() throws Exception {
        // Tạo user để lấy token
        testUser = new UserEntity();
        testUser.setUsername("Hyandepzai123");
        testUser.setPassword("sugoi123");
        testUser.setMail("hyandev2005@gmail.com");
        testUser = userService.create(testUser);

        // Đăng nhập để lấy token
        LoginRequest loginRequest = new LoginRequest("Hyandepzai123", "sugoi123");
        String response = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn().getResponse().getContentAsString();
        authToken = objectMapper.readTree(response).get("token").asText();

        testProduct = ProductEntity.builder()
                .name("iPhone 15 Pro")
                .price(new BigDecimal("25000000"))
                .quantity(10)
                .description("Smartphone cao cấp")
                .category(Category.DIEN_TU)
                .build();
        testProduct = productRepository.save(testProduct);
    }

    @AfterEach
    void cleanTest() {
        if (testProduct != null)
            productRepository.delete(testProduct);
        if (testUser != null)
            userRepository.delete(testUser);
    }

    // Method tái sử dụng
    private ResultActions performPost(String api, Object requestBody) throws Exception {
        return mockMvc.perform(post(api)
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody)));
    }

    private ResultActions performGet(String api) throws Exception {
        return mockMvc.perform(get(api)
                .header("Authorization", "Bearer " + authToken));
    }

    private ResultActions performPut(String api, Object requestBody) throws Exception {
        return mockMvc.perform(put(api)
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody)));
    }

    private ResultActions performDelete(String api) throws Exception {
        return mockMvc.perform(delete(api)
                .header("Authorization", "Bearer " + authToken));
    }

    // TEST CASES
    @Test
    @Tag("critical")
    @DisplayName("TC_PRODUCT_001: Tạo sản phẩm thành công với dữ liệu hợp lệ")
    void testCreateProductSuccess() throws Exception {
        // Arrange
        ProductRequest request = new ProductRequest(
                "Samsung Galaxy S24",
                new BigDecimal("20000000"),
                15,
                "Smartphone flagship của Samsung",
                Category.DIEN_TU
        );

        // Action
        ResultActions action = performPost("/products", request);

        // Assert
        action.andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Samsung Galaxy S24"))
                .andExpect(jsonPath("$.price").value(20000000))
                .andExpect(jsonPath("$.quantity").value(15))
                .andExpect(jsonPath("$.description").value("Smartphone flagship của Samsung"))
                .andExpect(jsonPath("$.category").value("DIEN_TU"))
                .andExpect(jsonPath("$.id").isNotEmpty());
    }

    @Test
    @Tag("critical")
    @DisplayName("TC_PRODUCT_002: Tạo sản phẩm thất bại khi tên sản phẩm rỗng")
    void testCreateProductFailEmptyName() throws Exception {
        // Arrange
        ProductRequest request = new ProductRequest(
                "",
                new BigDecimal("20000000"),
                15,
                "Mô tả sản phẩm",
                Category.DIEN_TU
        );

        // Action
        ResultActions action = performPost("/products", request);

        // Assert
        action.andExpect(status().isBadRequest());
    }

    @Test
    @Tag("critical")
    @DisplayName("TC_PRODUCT_003: Tạo sản phẩm thất bại khi tên quá ngắn")
    void testCreateProductFailNameTooShort() throws Exception {
        // Arrange
        ProductRequest request = new ProductRequest(
                "AB",
                new BigDecimal("20000000"),
                15,
                "Mô tả sản phẩm",
                Category.DIEN_TU
        );

        // Action
        ResultActions action = performPost("/products", request);

        // Assert
        action.andExpect(status().isBadRequest());
    }

    @Test
    @Tag("high")
    @DisplayName("TC_PRODUCT_004: Tạo sản phẩm thất bại khi giá <= 0")
    void testCreateProductFailInvalidPrice() throws Exception {
        // Arrange
        ProductRequest request = new ProductRequest(
                "Samsung Galaxy S24",
                new BigDecimal("0"),
                15,
                "Mô tả sản phẩm",
                Category.DIEN_TU
        );

        // Action
        ResultActions action = performPost("/products", request);

        // Assert
        action.andExpect(status().isBadRequest());
    }

    @Test
    @Tag("high")
    @DisplayName("TC_PRODUCT_005: Tạo sản phẩm thất bại khi số lượng âm")
    void testCreateProductFailNegativeQuantity() throws Exception {
        // Arrange
        ProductRequest request = new ProductRequest(
                "Samsung Galaxy S24",
                new BigDecimal("20000000"),
                -1,
                "Mô tả sản phẩm",
                Category.DIEN_TU
        );

        // Action
        ResultActions action = performPost("/products", request);

        // Assert
        action.andExpect(status().isBadRequest());
    }

    @Test
    @Tag("critical")
    @DisplayName("TC_PRODUCT_006: Lấy thông tin sản phẩm theo ID thành công")
    void testGetProductByIdSuccess() throws Exception {
        // Action
        ResultActions action = performGet("/products/" + testProduct.getId());

        // Assert
        action.andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testProduct.getId()))
                .andExpect(jsonPath("$.name").value("iPhone 15 Pro"))
                .andExpect(jsonPath("$.price").value(25000000))
                .andExpect(jsonPath("$.quantity").value(10))
                .andExpect(jsonPath("$.category").value("DIEN_TU"));
    }

    @Test
    @Tag("high")
    @DisplayName("TC_PRODUCT_007: Lấy sản phẩm thất bại khi ID không tồn tại")
    void testGetProductByIdNotFound() throws Exception {
        // Action
        ResultActions action = performGet("/products/99999");

        // Assert
        action.andExpect(status().isNotFound());
    }

    @Test
    @Tag("critical")
    @DisplayName("TC_PRODUCT_008: Lấy tất cả sản phẩm thành công")
    void testGetAllProductsSuccess() throws Exception {
        // Action
        ResultActions action = performGet("/products");

        // Assert
        action.andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.id == " + testProduct.getId() + ")]").exists());
    }

    @Test
    @Tag("critical")
    @DisplayName("TC_PRODUCT_009: Cập nhật sản phẩm thành công")
    void testUpdateProductSuccess() throws Exception {
        // Arrange
        ProductRequest request = new ProductRequest(
                "iPhone 15 Pro Max",
                new BigDecimal("30000000"),
                20,
                "Smartphone cao cấp nhất",
                Category.DIEN_TU
        );

        // Action
        ResultActions action = performPut("/products/" + testProduct.getId(), request);

        // Assert
        action.andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testProduct.getId()))
                .andExpect(jsonPath("$.name").value("iPhone 15 Pro Max"))
                .andExpect(jsonPath("$.price").value(30000000))
                .andExpect(jsonPath("$.quantity").value(20))
                .andExpect(jsonPath("$.description").value("Smartphone cao cấp nhất"));
    }

    @Test
    @Tag("high")
    @DisplayName("TC_PRODUCT_010: Cập nhật sản phẩm thất bại khi ID không tồn tại")
    void testUpdateProductNotFound() throws Exception {
        // Arrange
        ProductRequest request = new ProductRequest(
                "iPhone 15 Pro Max",
                new BigDecimal("30000000"),
                20,
                "Smartphone cao cấp nhất",
                Category.DIEN_TU
        );

        // Action
        ResultActions action = performPut("/products/99999", request);

        // Assert
        action.andExpect(status().isNotFound());
    }

    @Test
    @Tag("high")
    @DisplayName("TC_PRODUCT_011: Cập nhật sản phẩm thất bại với tên sản phẩm rỗng")
    void testUpdateProductFailInvalidData() throws Exception {
        // Arrange
        ProductRequest request = new ProductRequest(
                "",
                new BigDecimal("30000000"),
                20,
                "Mô tả",
                Category.DIEN_TU
        );

        // Action
        ResultActions action = performPut("/products/" + testProduct.getId(), request);

        // Assert
        action.andExpect(status().isBadRequest());
    }

    @Test
    @Tag("critical")
    @DisplayName("TC_PRODUCT_012: Xóa sản phẩm thành công")
    void testDeleteProductSuccess() throws Exception {
        // Action
        ResultActions action = performDelete("/products/" + testProduct.getId());

        // Assert
        action.andExpect(status().isNoContent());
        
        // Verify
        performGet("/products/" + testProduct.getId())
                .andExpect(status().isNotFound());
    }

    @Test
    @Tag("high")
    @DisplayName("TC_PRODUCT_013: Xóa sản phẩm thất bại khi ID không tồn tại")
    void testDeleteProductNotFound() throws Exception {
        // Action
        ResultActions action = performDelete("/products/99999");

        // Assert
        action.andExpect(status().isNotFound());
    }
}