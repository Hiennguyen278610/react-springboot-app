## 10 Câu Hỏi Kiểm Tra Code Backend

### **Câu 1: Authentication Flow**
**Hỏi:** Trong luồng đăng nhập (Login), khi user gửi request POST `/api/auth/login`, request đi qua những layer nào theo thứ tự? Hãy giải thích cụ thể luồng xử lý từ Controller → Service → Repository và response được trả về như thế nào. Code xử lý nằm ở file nào?

<details>
<summary><b>Đáp án:</b></summary>

Luồng xử lý:
1. **AuthController** (`src/main/java/com/flogin/controller/AuthController.java`) - Nhận request POST, validate `@RequestBody LoginRequest`
2. **AuthService** (`src/main/java/com/flogin/service/AuthService.java`) - Thực hiện logic:
   - Validate username/password theo rules (3-50 ký tự cho username, 6-100 cho password)
   - Kiểm tra user trong database thông qua UserRepository
   - So sánh password (có thể dùng BCrypt)
   - Nếu hợp lệ: generate JWT token qua JwtTokenProvider
3. **JwtTokenProvider** (`src/main/java/com/flogin/configuration/JwtTokenProvider.java`) - Generate JWT token
4. **Response:** Trả về `LoginResponse` chứa `success`, `message`, `token`, và `UserDto`

</details>

---

### **Câu 2: JWT Token Generation**
**Hỏi:** JWT token được generate như thế nào trong hệ thống? File nào chịu trách nhiệm tạo token, token chứa những thông tin gì (payload/claims), và thời gian expire được cấu hình ở đâu?

<details>
<summary><b>Đáp án:</b></summary>

- **File:** `src/main/java/com/flogin/configuration/JwtTokenProvider.java`
- **Cách tạo:**
  - Sử dụng library như `io.jsonwebtoken` (JJWT)
  - Method `generateToken(UserDetails userDetails)` hoặc `generateToken(String username)`
  - Claims/Payload thường chứa: `username`, `roles/authorities`, `iat` (issued at), `exp` (expiration)
  - Secret key được lấy từ `application.properties` (vd: `jwt.secret`)
  - Expire time config trong `application.properties` (vd: `jwt.expiration=86400000` - 24h)
- **Thuật toán:** Thường dùng HS256 (HMAC SHA-256)

</details>

---

### **Câu 3: Request Validation**
**Hỏi:** Validation cho LoginRequest được thực hiện ở đâu và như thế nào? Có sử dụng annotation validation không (@Valid, @NotBlank...)? Nếu validation fail, exception được handle ra sao và ở file nào?

<details>
<summary><b>Đáp án:</b></summary>

- **DTO Validation:** `src/main/java/com/flogin/dto/login/LoginRequest.java`
  - Sử dụng Jakarta/Hibernate Validator annotations:
    ```java
    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 50)
    @Pattern(regexp = "^[a-zA-Z0-9._-]+$")
    private String username;
    
    @NotBlank
    @Size(min = 6, max = 100)
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$")
    private String password;
    ```
- **Controller:** Dùng `@Valid` trước `@RequestBody LoginRequest`
- **Exception Handling:** 
  - File: `src/main/java/com/flogin/exception/GlobalExceptionHandler.java`
  - Catch `MethodArgumentNotValidException`
  - Trả về response với status 400 BAD_REQUEST và message lỗi chi tiết

</details>

---

### **Câu 4: Security Configuration**
**Hỏi:** JWT Filter được cấu hình và hoạt động như thế nào? Nó nằm ở đâu trong Security Filter Chain? File `SecurityConfig.java` cấu hình những gì (CORS, endpoints public/protected)?

<details>
<summary><b>Đáp án:</b></summary>

- **JwtFilter:** `src/main/java/com/flogin/configuration/JwtFilter.java`
  - Extends `OncePerRequestFilter`
  - Vị trí: Được add vào filter chain TRƯỚC `UsernamePasswordAuthenticationFilter`
  - Hoạt động:
    1. Lấy token từ header `Authorization: Bearer {token}`
    2. Validate token qua JwtTokenProvider
    3. Nếu valid: set Authentication vào SecurityContext
    
- **SecurityConfig:** `src/main/java/com/flogin/configuration/SecurityConfig.java`
  ```java
  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) {
      http.cors().and().csrf().disable()
          .authorizeHttpRequests()
          .requestMatchers("/api/auth/**").permitAll()
          .anyRequest().authenticated()
          .and()
          .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
  }
  ```

</details>

---

### **Câu 5: Product CRUD - Create Operation**
**Hỏi:** Khi tạo sản phẩm mới (POST `/api/products`), luồng xử lý diễn ra như thế nào? Validation cho ProductDto được thực hiện ở đâu? Mapper pattern có được sử dụng không và nằm ở file nào?

<details>
<summary><b>Đáp án:</b></summary>

**Luồng:**
1. **ProductController** (`src/main/java/com/flogin/controller/ProductController.java`)
   ```java
   @PostMapping
   public ResponseEntity<ProductDto> createProduct(@Valid @RequestBody ProductDto dto) {
       return productService.createProduct(dto);
   }
   ```

2. **ProductDto Validation** (`src/main/java/com/flogin/dto/product/ProductDto.java`)
   ```java
   @NotBlank
   @Size(min = 3, max = 100)
   private String name;
   
   @Positive
   @Max(999999999)
   private Double price;
   
   @Min(0)
   @Max(99999)
   private Integer quantity;
   ```

3. **ProductService** (`src/main/java/com/flogin/service/ProductService.java`)
   - Convert DTO → Entity qua Mapper
   - Lưu vào database qua Repository
   - Convert Entity → DTO để trả về

4. **Mapper:** `src/main/java/com/flogin/mapper/ProductMapper.java`
   - Method `toEntity(ProductDto dto)` và `toDto(Product entity)`

</details>

---

### **Câu 6: Exception Handling Strategy**
**Hỏi:** Hệ thống xử lý exception như thế nào? Có bao nhiêu loại custom exception được định nghĩa? Global Exception Handler được implement ở đâu và handle những exception nào?

<details>
<summary><b>Đáp án:</b></summary>

**Custom Exceptions** (trong `src/main/java/com/flogin/exception/`):
- `AuthenticationException` - Lỗi đăng nhập
- `ResourceNotFoundException` - Không tìm thấy resource
- `ValidationException` - Lỗi validation nghiệp vụ
- `BadRequestException` - Request không hợp lệ

**GlobalExceptionHandler** (`src/main/java/com/flogin/exception/GlobalExceptionHandler.java`):
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(...) {
        // Return 400 với field errors
    }
    
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuth(...) {
        // Return 401
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(...) {
        // Return 404
    }
}
```

</details>

---

### **Câu 7: Product Update Logic**
**Hỏi:** Khi cập nhật sản phẩm (PUT `/api/products/{id}`), làm thế nào để đảm bảo chỉ update các field được gửi lên mà không làm mất dữ liệu cũ? Logic này được implement ở file nào?

<details>
<summary><b>Đáp án:</b></summary>

**File:** `src/main/java/com/flogin/service/ProductService.java`

**Logic:**
```java
public ProductDto updateProduct(Long id, ProductDto dto) {
    // 1. Tìm product hiện tại
    Product existingProduct = productRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    
    // 2. Update chỉ các field không null
    if (dto.getName() != null) {
        existingProduct.setName(dto.getName());
    }
    if (dto.getPrice() != null) {
        existingProduct.setPrice(dto.getPrice());
    }
    if (dto.getQuantity() != null) {
        existingProduct.setQuantity(dto.getQuantity());
    }
    
    // 3. Save và return
    Product updated = productRepository.save(existingProduct);
    return productMapper.toDto(updated);
}
```

**Alternative:** Sử dụng `BeanUtils.copyProperties()` với `ignoreNullValues`

</details>

---

### **Câu 8: Repository Pattern**
**Hỏi:** UserRepository và ProductRepository được khai báo như thế nào? Có sử dụng custom query methods không? Nếu có, cho ví dụ một custom method và giải thích naming convention của Spring Data JPA.

<details>
<summary><b>Đáp án:</b></summary>

**File:** 
- `src/main/java/com/flogin/repository/UserRepository.java`
- `src/main/java/com/flogin/repository/ProductRepository.java`

**Khai báo:**
```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Spring Data JPA tự generate query
    Optional<User> findByUsername(String username);
    
    Boolean existsByUsername(String username);
    
    // Custom query với @Query
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.active = true")
    Optional<User> findActiveUserByEmail(@Param("email") String email);
}
```

**Naming Convention:**
- `findBy{Property}` → SELECT WHERE property = ?
- `existsBy{Property}` → SELECT COUNT(*) WHERE... > 0
- `deleteBy{Property}` → DELETE WHERE...
- `findBy{Property}And{Property2}` → Multiple conditions

</details>

---

### **Câu 9: Entity Relationships**
**Hỏi:** Các Entity (User, Product) được định nghĩa như thế nào? Có sử dụng annotation nào để map với database (@Entity, @Table, @Id...)? Các field được validate ở entity level không?

<details>
<summary><b>Đáp án:</b></summary>

**Files:**
- `src/main/java/com/flogin/entity/User.java`
- `src/main/java/com/flogin/entity/Product.java`

**User Entity:**
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String username;
    
    @Column(nullable = false)
    private String password; // Stored as BCrypt hash
    
    @Column(unique = true)
    private String email;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

**Product Entity:**
```java
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false)
    private Double price;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(length = 500)
    private String description;
    
    private String category;
}
```

</details>

---

### **Câu 10: Application Configuration**
**Hỏi:** File `application.properties` chứa những cấu hình gì? JWT secret, database connection, và các properties quan trọng khác được config như thế nào? Có sử dụng environment variables hoặc profiles không?

<details>
<summary><b>Đáp án:</b></summary>

**File:** `src/main/resources/application.properties`

**Cấu hình:**
```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/api

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/flogin_db
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD:password}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Configuration
jwt.secret=${JWT_SECRET:mySecretKey123}
jwt.expiration=86400000

# CORS Configuration
cors.allowed-origins=http://localhost:3000

# File Upload
spring.servlet.multipart.max-file-size=10MB

# Logging
logging.level.com.flogin=DEBUG
```

**Environment Variables:**
- Có thể dùng `${VAR_NAME:default_value}`
- Hoặc tạo file `.env` và load qua `@PropertySource`
- Profiles: `application-dev.properties`, `application-prod.properties`

</details>
