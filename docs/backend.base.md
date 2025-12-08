# **PHẦN A: CÂU HỎI VỀ BACKEND SOURCE CODE (20 câu)**

## **I. CÂU HỎI NHẬN BIẾT (5 câu) - 1 điểm/câu**

**Câu 1:** Framework nào được sử dụng để xây dựng backend trong dự án FloginFE_BE?
- A. Django
- B. Spring Boot
- C. Express.js
- D. Laravel
- **Đáp án: B**

**Câu 2:** Annotation nào được sử dụng để đánh dấu một class là REST Controller trong Spring Boot?
- A. @Service
- B. @Repository
- C. @RestController
- D. @Component
- **Đáp án: C**

**Câu 3:** Trong Spring Boot, annotation nào được dùng để inject dependency?
- A. @Inject
- B. @Autowired
- C. @Bean
- D. @Value
- **Đáp án: B**

**Câu 4:** Build tool nào được sử dụng trong project backend?
- A. Gradle
- B. Ant
- C. Maven
- D. NPM
- **Đáp án: C**

**Câu 5:** Layer nào trong Spring Boot chịu trách nhiệm tương tác trực tiếp với database?
- A. Controller
- B. Service
- C. Repository
- D. Configuration
- **Đáp án: C**

---

## **II. CÂU HỎI THÔNG HIỂU (12 câu) - 2 điểm/câu**

**Câu 6:** Giải thích vai trò của `AuthService` trong kiến trúc backend. Service này thực hiện những chức năng gì?

**Đáp án mẫu:**
- `AuthService` là tầng Business Logic xử lý các nghiệp vụ liên quan đến xác thực người dùng
- Chức năng chính:
  + Xác thực thông tin đăng nhập (username/password)
  + Tạo JWT token sau khi đăng nhập thành công
  + Validate thông tin người dùng
  + Xử lý logic lấy thông tin user hiện tại từ token
- Tách biệt logic nghiệp vụ khỏi Controller, tuân theo Single Responsibility Principle

**Câu 7:** Phân tích cấu trúc của `LoginRequest` DTO. Tại sao cần sử dụng DTO thay vì dùng trực tiếp Entity?

**Đáp án mẫu:**
- DTO (Data Transfer Object) là object chuyên dùng để truyền dữ liệu giữa các layer
- Lý do sử dụng DTO:
  + Tách biệt tầng presentation với tầng persistence
  + Bảo mật: Không expose toàn bộ thuộc tính của Entity
  + Validation: Có thể thêm validation riêng cho input
  + Flexibility: Dễ dàng thay đổi cấu trúc response mà không ảnh hưởng database
  + Giảm coupling giữa các layer

**Câu 8:** So sánh sự khác biệt giữa `@WebMvcTest` và `@SpringBootTest`. Khi nào nên dùng từng loại?

**Đáp án mẫu:**
- `@WebMvcTest`:
  + Chỉ load Web layer (Controller)
  + Nhẹ, nhanh hơn
  + Cần mock các dependencies (Service, Repository)
  + Dùng cho Integration test của Controller layer
  
- `@SpringBootTest`:
  + Load toàn bộ Application Context
  + Nặng hơn, chậm hơn
  + Test end-to-end với tất cả layers
  + Dùng cho Integration test toàn hệ thống

**Câu 9:** Giải thích cơ chế hoạt động của JWT trong hệ thống authentication. Token được tạo và validate như thế nào?

**Đáp án mẫu:**
- JWT (JSON Web Token) gồm 3 phần: Header.Payload.Signature
- Quy trình:
  + Login thành công → Server tạo JWT chứa user info
  + Token được sign bằng secret key
  + Client lưu token (localStorage/cookie)
  + Mỗi request gửi token qua header `Authorization: Bearer <token>`
  + Server validate signature và extract user info
  + Không cần query database mỗi request
- Ưu điểm: Stateless, scalable, giảm tải database

**Câu 10:** Phân tích validation rules cho Product entity. Tại sao cần validation ở cả frontend và backend?

**Đáp án mẫu:**
- Validation rules cho Product:
  + Name: 3-100 ký tự, không rỗng
  + Price: > 0, <= 999,999,999
  + Quantity: >= 0, <= 99,999
  + Description: <= 500 ký tự
  
- Cần validation 2 tầng:
  + Frontend: UX tốt hơn, feedback nhanh, giảm request không cần thiết
  + Backend: Bảo mật, không tin tưởng client, đảm bảo data integrity
  + Defense in depth strategy

**Câu 11:** Giải thích vai trò của `@Mock` và `@InjectMocks` trong Mockito. Sự khác biệt là gì?

**Đáp án mẫu:**
- `@Mock`: Tạo mock object (giả lập) cho một dependency
  + Không có implementation thật
  + Cần define behavior bằng `when().thenReturn()`
  
- `@InjectMocks`: Tạo instance của class cần test và tự động inject các @Mock vào
  + Có implementation thật của class
  + Các dependencies là mock objects
  
- Ví dụ:
```java
@Mock
private ProductRepository repository; // Mock
@InjectMocks
private ProductService service; // Real class với mocked repository
```

**Câu 12:** Mô tả luồng xử lý của một HTTP request từ client đến database trong Spring Boot architecture.

**Đáp án mẫu:**
1. Client gửi HTTP request → DispatcherServlet
2. DispatcherServlet → @RestController (routing)
3. Controller validate request → gọi Service layer
4. Service xử lý business logic → gọi Repository
5. Repository (JPA) → Database query
6. Data trả về: Repository → Service → Controller
7. Controller serialize data → HTTP Response → Client

**Câu 13:** Phân tích ý nghĩa của test coverage. Coverage 85% có nghĩa là gì? Có đảm bảo code không có bug không?

**Đáp án mẫu:**
- Coverage 85% = 85% dòng code được execute trong tests
- Loại coverage:
  + Line coverage: % dòng code
  + Branch coverage: % nhánh điều kiện
  + Method coverage: % methods
  
- Coverage cao ≠ không bug:
  + Chỉ đo lường quantity, không đo quality
  + Có thể test nhưng không assert đúng
  + Không catch được logic errors
  + Cần kết hợp với code review, quality tests

**Câu 14:** So sánh Unit Test, Integration Test và E2E Test. Cho ví dụ cụ thể trong dự án.

**Đáp án mẫu:**
- **Unit Test:**
  + Test từng component độc lập
  + Mock dependencies
  + Ví dụ: Test `validateUsername()` method
  + Nhanh, dễ debug
  
- **Integration Test:**
  + Test tương tác giữa nhiều components
  + Ví dụ: Test Controller + Service với MockMvc
  + Phát hiện lỗi integration
  
- **E2E Test:**
  + Test toàn bộ flow từ UI đến DB
  + Ví dụ: Test login flow với Cypress
  + Chậm nhất, giống user thật

**Câu 15:** Giải thích Test-Driven Development (TDD). Quy trình Red-Green-Refactor là gì?

**Đáp án mẫu:**
- TDD: Viết test trước, code sau
- Quy trình Red-Green-Refactor:
  1. **Red**: Viết test → Test fail (chưa có code)
  2. **Green**: Viết code tối thiểu để pass test
  3. **Refactor**: Cải thiện code, giữ test pass
  
- Lợi ích:
  + Code có testability cao
  + Design tốt hơn
  + Ít bug hơn
  + Living documentation

**Câu 16:** Phân tích cấu trúc của một test method theo pattern AAA (Arrange-Act-Assert).

**Đáp án mẫu:**
- **Arrange** (Given): Chuẩn bị test data, mock behavior
```java
LoginRequest request = new LoginRequest("user", "pass");
when(service.authenticate()).thenReturn(response);
```

- **Act** (When): Thực hiện hành động cần test
```java
LoginResponse result = service.authenticate(request);
```

- **Assert** (Then): Kiểm tra kết quả
```java
assertEquals("Success", result.getMessage());
assertNotNull(result.getToken());
```

**Câu 17:** Giải thích sự khác biệt giữa `assertEquals()` và `assertSame()` trong JUnit. Khi nào dùng từng loại?

**Đáp án mẫu:**
- `assertEquals(expected, actual)`:
  + So sánh giá trị (value equality)
  + Dùng method `equals()`
  + Dùng cho: String, Integer, Objects với equals()
  
- `assertSame(expected, actual)`:
  + So sánh reference (identity)
  + Dùng operator `==`
  + Kiểm tra cùng object instance
  
- Ví dụ:
```java
String a = "test";
String b = new String("test");
assertEquals(a, b); // Pass
assertSame(a, b);   // Fail
```

---

## **III. CÂU HỎI VẬN DỤNG (3 câu) - 3 điểm/câu**

**Câu 18:** Thiết kế test cases để kiểm tra tính năng CRUD của Product Service. Cần bao gồm những test scenarios nào? Viết pseudo-code cho 3 test cases quan trọng nhất.

**Đáp án mẫu:**

**Test Scenarios:**
1. Happy path: Create/Read/Update/Delete thành công
2. Validation: Price âm, quantity âm, name rỗng
3. Edge cases: Product không tồn tại, duplicate name
4. Boundary: Max price, max quantity, min/max name length
5. Concurrent: Cập nhật đồng thời
6. Cascade: Delete product có references

**3 Test cases quan trọng:**

```java
// TC1: Create product thành công
@Test
void testCreateProduct_Success() {
    // Arrange
    ProductDto input = new ProductDto("Laptop", 15000000, 10);
    Product entity = new Product(1L, "Laptop", 15000000, 10);
    when(repository.save(any())).thenReturn(entity);
    
    // Act
    ProductDto result = service.createProduct(input);
    
    // Assert
    assertNotNull(result);
    assertEquals("Laptop", result.getName());
    verify(repository).save(any());
}

// TC2: Update product - not found
@Test
void testUpdateProduct_NotFound() {
    // Arrange
    when(repository.findById(999L)).thenReturn(Optional.empty());
    
    // Act & Assert
    assertThrows(NotFoundException.class, 
        () -> service.updateProduct(999L, new ProductDto()));
}

// TC3: Delete product với validation
@Test
void testDeleteProduct_Success() {
    // Arrange
    Product product = new Product(1L, "Laptop", 15000000, 10);
    when(repository.findById(1L)).thenReturn(Optional.of(product));
    
    // Act
    service.deleteProduct(1L);
    
    // Assert
    verify(repository).delete(product);
}
```

**Câu 19:** Phân tích và đề xuất cách improve code coverage từ 70% lên 90% cho AuthService. Cần test thêm những gì? Viết test plan chi tiết.

**Đáp án mẫu:**

**Test Plan để tăng coverage:**

**1. Phân tích coverage hiện tại:**
- Identify untested branches
- Identify untested exception paths
- Identify edge cases

**2. Test cases cần bổ sung:**

**A. Validation Tests:**
```java
@Test void testValidateUsername_Empty()
@Test void testValidateUsername_TooShort()
@Test void testValidateUsername_TooLong()
@Test void testValidateUsername_InvalidChars()
@Test void testValidatePassword_NoNumber()
@Test void testValidatePassword_NoLetter()
```

**B. Exception Handling:**
```java
@Test void testAuthenticate_NullRequest()
@Test void testAuthenticate_EmptyUsername()
@Test void testAuthenticate_DatabaseError()
@Test void testGetCurrentUser_ExpiredToken()
@Test void testGetCurrentUser_InvalidToken()
```

**C. Edge Cases:**
```java
@Test void testAuthenticate_SpecialCharacters()
@Test void testAuthenticate_WhitespaceInPassword()
@Test void testAuthenticate_CaseSensitivity()
@Test void testGetCurrentUser_MalformedToken()
```

**D. Integration Scenarios:**
```java
@Test void testAuthenticate_ConcurrentLogins()
@Test void testAuthenticate_RateLimiting()
@Test void testTokenRefresh()
```

**3. Metrics:**
- Target: 90% line coverage
- Target: 85% branch coverage
- All public methods covered
- All exception paths tested

**Câu 20:** Thiết kế một CI/CD pipeline hoàn chỉnh cho backend project. Pipeline cần bao gồm những stages nào? Giải thích từng stage và viết cấu hình GitHub Actions.

**Đáp án mẫu:**

**CI/CD Pipeline Design:**

**Stages:**
1. **Build** - Compile code
2. **Unit Tests** - Run fast tests
3. **Integration Tests** - Test with mocks
4. **Code Quality** - SonarQube, Checkstyle
5. **Security Scan** - OWASP dependency check
6. **Package** - Build JAR
7. **Deploy** - Deploy to environment

**GitHub Actions Configuration:**

```yaml
name: Backend CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Set up JDK 21
      uses: actions/setup-java@v3
      with:
        java-version: '21'
        distribution: 'temurin'
        cache: maven
    
    - name: Build with Maven
      run: mvn clean compile
      working-directory: ./backend
    
    - name: Run Unit Tests
      run: mvn test
      working-directory: ./backend
    
    - name: Run Integration Tests
      run: mvn verify -P integration-tests
      working-directory: ./backend
    
    - name: Generate Coverage Report
      run: mvn jacoco:report
      working-directory: ./backend
    
    - name: Upload Coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./backend/target/site/jacoco/jacoco.xml
        fail_ci_if_error: true
    
    - name: SonarQube Scan
      env:
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      run: |
        mvn sonar:sonar \
          -Dsonar.projectKey=flogin-backend \
          -Dsonar.host.url=${{ secrets.SONAR_HOST_URL }}
    
    - name: Security Scan
      run: mvn dependency-check:check
      working-directory: ./backend
    
    - name: Build JAR
      run: mvn package -DskipTests
      working-directory: ./backend
    
    - name: Archive artifacts
      uses: actions/upload-artifact@v3
      with:
        name: backend-jar
        path: backend/target/*.jar

  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Download artifact
      uses: actions/download-artifact@v3
      with:
        name: backend-jar
    
    - name: Deploy to production
      run: |
        # Deploy logic here
        echo "Deploying to production..."
```

**Quality Gates:**
- Code coverage >= 80%
- No critical security vulnerabilities
- No code smells
- All tests pass
- Build successful

---

# **PHẦN B: CÂU HỎI VỀ TEST CASES ĐÃ VIẾT (20 câu)**

## **I. CÂU HỎI NHẬN BIẾT (5 câu) - 1 điểm/câu**

**Câu 21:** Annotation `@DisplayName` trong JUnit 5 có mục đích gì?
- A. Đặt tên cho test class
- B. Hiển thị tên mô tả cho test case trong report
- C. Đánh dấu test method
- D. Config test environment
- **Đáp án: B**

**Câu 22:** Framework nào được sử dụng để mock objects trong backend tests?
- A. JUnit
- B. Mockito
- C. Selenium
- D. TestNG
- **Đáp án: B**

**Câu 23:** `MockMvc` trong Spring Boot được dùng để test layer nào?
- A. Service
- B. Repository
- C. Controller (Web layer)
- D. Configuration
- **Đáp án: C**

**Câu 24:** Trong Test-Driven Development, bước nào được thực hiện đầu tiên?
- A. Viết code implementation
- B. Viết test case
- C. Refactor code
- D. Deploy code
- **Đáp án: B**

**Câu 25:** Tool nào được dùng để đo test coverage trong Java project?
- A. JaCoCo
- B. ESLint
- C. Prettier
- D. Webpack
- **Đáp án: A**

---

## **II. CÂU HỎI THÔNG HIỂU (12 câu) - 2 điểm/câu**

**Câu 26:** Phân tích test case `TC_LOGIN_001`. Tại sao đây là test case Critical? Test này cover được những gì?

**Đáp án mẫu:**
- **TC_LOGIN_001**: Đăng nhập thành công với credentials hợp lệ
- **Lý do Critical:**
  + Happy path - flow chính của use case
  + Nếu fail → toàn bộ chức năng login không hoạt động
  + Ảnh hưởng trực tiếp đến user experience
  + Basic functionality cần thiết
  
- **Coverage:**
  + Validate input đúng format
  + Authentication logic
  + Token generation
  + Response structure
  + Success flow hoàn chỉnh

**Câu 27:** So sánh test case `TC_LOGIN_002` (user không tồn tại) và `TC_LOGIN_003` (password sai). Tại sao cần tách làm 2 test cases riêng?

**Đáp án mẫu:**
- **TC_LOGIN_002**: Username không tồn tại trong DB
- **TC_LOGIN_003**: Username tồn tại nhưng password sai

- **Lý do tách riêng:**
  + Test different code paths
  + TC_LOGIN_002: Query database → no result
  + TC_LOGIN_003: Query database → found → compare password → fail
  + Different error messages
  + Different business logic
  + Easier debugging khi test fail
  + Single Responsibility: Mỗi test chỉ test 1 scenario

**Câu 28:** Giải thích cấu trúc của test case trong Integration Test. Tại sao cần setup `MockMvc` và mock `AuthService`?

**Đáp án mẫu:**
```java
@WebMvcTest(AuthController.class)
class AuthControllerIntegrationTest {
    @Autowired private MockMvc mockMvc;
    @MockBean private AuthService authService;
}
```

- **MockMvc**: Simulate HTTP requests mà không cần start server
  + Test Controller layer
  + Verify request mapping, status codes
  + Check response body
  + Fast execution
  
- **Mock AuthService**: 
  + Integration test chỉ test Controller layer
  + Không test Service implementation
  + Control behavior của Service
  + Isolate từng layer
  + @WebMvcTest không load Service beans

**Câu 29:** Phân tích method `when().thenReturn()` trong Mockito. Trong test nào đã sử dụng và tại sao?

**Đáp án mẫu:**
- **Syntax:**
```java
when(service.authenticate(any()))
    .thenReturn(mockResponse);
```

- **Ý nghĩa:**
  + Define behavior cho mock object
  + Khi gọi `service.authenticate(any())` → return `mockResponse`
  + Stubbing: Giả lập response mà không execute code thật
  
- **Sử dụng trong:**
  + Mock tests: ProductServiceTest, AuthServiceTest
  + Integration tests: AuthControllerTest
  
- **Lý do:**
  + Control test data
  + Không phụ thuộc external dependencies
  + Test deterministic
  + Fast execution

**Câu 30:** Đánh giá boundary test cases cho Product validation. Những boundary values nào cần test thêm?

**Đáp án mẫu:**

**Đã test:**
- Price > 0
- Quantity >= 0

**Cần test thêm:**

**1. Product Name:**
```java
@Test void testName_MinLength3()        // "Lap"
@Test void testName_MaxLength100()      // 100 chars
@Test void testName_101Chars()          // Fail
@Test void testName_2Chars()            // Fail
```

**2. Price:**
```java
@Test void testPrice_Zero()             // Fail
@Test void testPrice_One()              // Pass (min valid)
@Test void testPrice_MaxValue()         // 999,999,999
@Test void testPrice_OverMax()          // 1,000,000,000 (Fail)
@Test void testPrice_Negative()         // Fail
```

**3. Quantity:**
```java
@Test void testQuantity_Zero()          // Pass
@Test void testQuantity_MaxValue()      // 99,999
@Test void testQuantity_OverMax()       // 100,000 (Fail)
@Test void testQuantity_Negative()      // Fail
```

**4. Description:**
```java
@Test void testDescription_Empty()      // Pass
@Test void testDescription_500Chars()   // Max valid
@Test void testDescription_501Chars()   // Fail
```

**Câu 31:** So sánh Mock Test và Unit Test. Test cases nào thuộc loại nào? Sự khác biệt trong implementation?

**Đáp án mẫu:**

**Mock Test:**
- File: mock
- Characteristics:
  + Heavy mocking của dependencies
  + Test interactions giữa components
  + Verify method calls
  + Stub external dependencies
  
**Example:**
```java
// Mock Test
@MockBean private AuthService authService;

when(authService.authenticate(any()))
    .thenReturn(mockResponse);
    
verify(authService, times(1)).authenticate(any());
```

**Unit Test:**
- File: unit
- Characteristics:
  + Test logic thuần túy
  + Minimal/no mocking
  + Focus on algorithms, calculations
  + Pure functions
  
**Example:**
```java
// Unit Test
@Test
void testValidateUsername() {
    String result = ValidationUtils.validateUsername("abc");
    assertEquals("", result); // No error
}
```

**Key Differences:**
| Aspect | Mock Test | Unit Test |
|--------|-----------|-----------|
| Dependencies | Mocked | Real/minimal |
| Scope | Component interaction | Single method |
| Verification | Behavior verification | State verification |
| Speed | Fast | Fastest |

**Câu 32:** Phân tích test coverage report. Làm thế nào để đạt được coverage >= 85% như yêu cầu?

**Đáp án mẫu:**

**Phân tích Coverage Report:**
1. **Line Coverage**: % dòng code được execute
2. **Branch Coverage**: % nhánh if/else/switch
3. **Method Coverage**: % methods được gọi

**Chiến lược đạt 85%:**

**1. Identify Gaps:**
```bash
mvn jacoco:report
# Xem report tại target/site/jacoco/index.html
# Red lines = uncovered code
```

**2. Priority Areas:**
- **Critical Paths**: Login, CRUD operations
- **Exception Handling**: Try-catch blocks
- **Validation Logic**: All validation methods
- **Business Logic**: Core algorithms

**3. Test Cases cần thêm:**
```java
// Exception paths
@Test void testLogin_DatabaseException()
@Test void testCreateProduct_DuplicateName()

// Edge cases
@Test void testUpdateProduct_ConcurrentModification()
@Test void testDeleteProduct_WithReferences()

// Validation branches
@Test void testValidatePrice_AllBoundaries()
@Test void testValidateQuantity_NegativeAndZero()
```

**4. Exclude từ coverage:**
```xml
<!-- pom.xml -->
<configuration>
  <excludes>
    <exclude>**/dto/**</exclude>
    <exclude>**/config/**</exclude>
  </excludes>
</configuration>
```

**5. Metrics:**
- Target: 85% overall
- Controller: 80%
- Service: 90% (business logic)
- Repository: Exclude (Spring Data)

**Câu 33:** Giải thích tại sao cần test cả Success và Failure scenarios. Cho ví dụ từ test cases đã viết.

**Đáp án mẫu:**

**Lý do test cả 2:**

**1. Success Scenarios:**
- Verify happy path works
- Confirm correct output
- Validate business logic
- User can complete tasks

**2. Failure Scenarios:**
- Test error handling
- Verify proper error messages
- Prevent system crashes
- Security: reject invalid input
- User experience: helpful errors

**Examples từ project:**

**Success:**
```java
@Test
@DisplayName("TC_LOGIN_001: Đăng nhập thành công")
void testLoginSuccess() {
    // Valid credentials
    LoginRequest request = new LoginRequest("user", "Pass123");
    
    LoginResponse response = service.authenticate(request);
    
    assertTrue(response.isSuccess());
    assertNotNull(response.getToken());
}
```

**Failure:**
```java
@Test
@DisplayName("TC_LOGIN_002: User không tồn tại")
void testLoginFail_UserNotFound() {
    LoginRequest request = new LoginRequest("invalid", "Pass123");
    
    LoginResponse response = service.authenticate(request);
    
    assertFalse(response.isSuccess());
    assertEquals("User not found", response.getMessage());
}

@Test
@DisplayName("TC_LOGIN_003: Password sai")
void testLoginFail_WrongPassword() {
    LoginRequest request = new LoginRequest("user", "wrong");
    
    LoginResponse response = service.authenticate(request);
    
    assertFalse(response.isSuccess());
    assertEquals("Invalid password", response.getMessage());
}
```

**Coverage:**
- Success: 1 path
- Failures: Multiple paths (user not found, wrong password, validation errors, etc.)
- Failures chiếm ~70% code paths

**Câu 34:** Đánh giá test data được sử dụng trong test cases. Test data có đại diện đủ các scenarios không?

**Đáp án mẫu:**

**Test Data Analysis:**

**1. Login Test Data:**
```java
// Valid
username: "testuser", password: "Test123"

// Invalid - cần thêm:
username: "ab",          password: "123"      // Too short
username: "user@#$",     password: "abc"      // Invalid chars
username: "a".repeat(51), password: "12345"   // Too long
username: "",            password: ""         // Empty
username: "test user",   password: "Test 123" // Whitespace
```

**2. Product Test Data:**
```java
// Valid
name: "Laptop Dell", price: 15000000, quantity: 10

// Boundary - cần thêm:
name: "Lap",            price: 1,          quantity: 0
name: "L".repeat(100),  price: 999999999,  quantity: 99999
name: "L".repeat(101),  price: 0,          quantity: -1
name: "",               price: -1000,      quantity: 100000
```

**3. Categories:**
```java
// Cần test với nhiều categories:
"Electronics", "Books", "Clothing", "Food"
"Invalid Category" // Should fail
```

**Recommendations:**

**A. Equivalence Partitioning:**
- Valid partition: 1 test case
- Each invalid partition: 1 test case

**B. Data Variation:**
```java
@ParameterizedTest
@ValueSource(strings = {"user", "admin", "test123"})
void testValidUsernames(String username) {
    // Test multiple valid values
}

@CsvSource({
    "ab, Too short",
    "user@#, Invalid characters",
    "' ', Cannot be empty"
})
void testInvalidUsernames(String username, String expectedError) {
    // Test multiple invalid values
}
```

**Câu 35:** Phân tích test case `TC_PRODUCT_001` (Create product). Preconditions có đầy đủ không? Thiếu gì?

**Đáp án mẫu:**

**Current Preconditions:**
- User đã đăng nhập
- User có quyền tạo sản phẩm

**Analysis:**

**Thiếu Preconditions:**

**1. System State:**
- Database connection available
- Application is running and healthy
- No system maintenance mode

**2. Data Prerequisites:**
- Category "Electronics" exists in database
- Product "Laptop Dell" chưa tồn tại (unique constraint)
- User session chưa expired

**3. Permissions:**
- User role = ADMIN or MANAGER
- User account is active (not locked/suspended)

**4. Business Rules:**
- Product quota not exceeded
- Budget/inventory limits not reached

**Complete Preconditions:**
```
Preconditions:
- System:
  + Application running on port 8080
  + Database connected and accessible
  + No scheduled maintenance
  
- Authentication:
  + User "admin" logged in
  + JWT token valid (not expired)
  + Session active
  
- Authorization:
  + User has role: ADMIN
  + Permission: CREATE_PRODUCT granted
  
- Data:
  + Category "Electronics" exists (ID: 1)
  + Product name "Laptop Dell" not duplicated
  + Database has capacity for new records
  
- Business:
  + Product count < MAX_PRODUCTS_PER_USER
  + No pending transactions for this category
```

**Câu 36:** Giải thích verification trong test. `verify()` và `assertEquals()` khác nhau như thế nào?

**Đáp án mẫu:**

**1. `assertEquals()` - State Verification:**
```java
@Test
void testStateVerification() {
    LoginResponse response = service.authenticate(request);
    
    // Verify STATE/RESULT
    assertEquals("Success", response.getMessage());
    assertNotNull(response.getToken());
    assertTrue(response.isSuccess());
}
```
- Kiểm tra **KẾT QUẢ**
- What was returned?
- State of objects
- Output values

**2. `verify()` - Behavior Verification:**
```java
@Test
void testBehaviorVerification() {
    service.authenticate(request);
    
    // Verify BEHAVIOR/INTERACTION
    verify(repository, times(1)).findByUsername("user");
    verify(tokenProvider).generateToken(any());
    verify(repository, never()).save(any());
}
```
- Kiểm tra **HÀNH VI**
- Was method called?
- How many times?
- With what parameters?

**So sánh:**

| Aspect | assertEquals | verify |
|--------|--------------|--------|
| Purpose | Check result | Check interaction |
| Type | State | Behavior |
| When | After action | After action |
| What | Return value | Method calls |
| Use with | Actual values | Mock objects |

**Example kết hợp:**
```java
@Test
void testCreateProduct_Complete() {
    // Mock behavior
    when(repository.save(any())).thenReturn(savedProduct);
    
    // Act
    ProductDto result = service.createProduct(input);
    
    // State verification
    assertEquals("Laptop", result.getName());
    assertNotNull(result.getId());
    
    // Behavior verification
    verify(repository).save(any());
    verify(mapper).toDto(savedProduct);
}
```

**Câu 37:** Đánh giá chiến lược test priority (Critical, High, Medium, Low). Test cases nào được prioritize và tại sao?

**Đáp án mẫu:**

**Test Priority Strategy:**

**1. CRITICAL (P0):**
- **Must pass** trước khi release
- Block deployment nếu fail

**Test Cases:**
```
TC_LOGIN_001: Login thành công
TC_PRODUCT_001: Create product thành công
TC_PRODUCT_004: Delete product
```

**Lý do:**
- Core functionality
- Happy path
- Ảnh hưởng trực tiếp users
- High usage frequency
- Revenue impact

**2. HIGH (P1):**
- **Should pass** trước release
- Can release with known issues + workaround

**Test Cases:**
```
TC_LOGIN_002: User không tồn tại
TC_LOGIN_003: Password sai
TC_PRODUCT_002: Update product
TC_PRODUCT_003: Get product details
```

**Lý do:**
- Error handling
- Security validations
- Data integrity
- Common scenarios

**3. MEDIUM (P2):**
- Nice to have
- Can fix in next release

**Test Cases:**
```
TC_LOGIN_004: Token validation
TC_PRODUCT_005: Search/Filter
TC_PRODUCT_006: Pagination
```

**Lý do:**
- Secondary features
- Edge cases
- Performance optimizations
- UX improvements

**4. LOW (P3):**
- Optional
- Future enhancements

**Test Cases:**
```
TC_LOGIN_007: Remember me
TC_PRODUCT_007: Bulk operations
TC_PRODUCT_008: Export data
```

**Lý do:**
- Rarely used features
- Nice-to-have functionality
- Low business impact

**Execution Order:**
1. Smoke tests (Critical happy paths)
2. Regression tests (High + Critical)
3. Full suite (All priorities)

**CI/CD Integration:**
```yaml
# Every commit
- run: Critical tests only

# Pull Request
- run: Critical + High tests

# Nightly
- run: All tests (Critical → Low)
```

---

## **III. CÂU HỎI VẬN DỤNG (3 câu) - 3 điểm/câu**

**Câu 38:** Dựa vào test results hiện tại, phân tích các test đã pass/fail. Nếu có test fail, root cause là gì và cách fix?

**Đáp án mẫu:**

**Test Results Analysis:**

**1. Check Test Reports:**
```bash
# Run tests
cd backend
./mvnw test

# Check report
cat target/surefire-reports/*.txt
```

**2. Common Failure Patterns:**

**A. NullPointerException:**
```java
// FAILED TEST
@Test
void testGetProduct() {
    Product product = service.getProduct(999L);
    assertEquals("Laptop", product.getName()); // NPE!
}

// ROOT CAUSE:
// - Product ID 999 không tồn tại
// - Service return null
// - Không check null trước khi access

// FIX:
@Test
void testGetProduct_NotFound() {
    assertThrows(NotFoundException.class, 
        () -> service.getProduct(999L));
}

@Test
void testGetProduct_Success() {
    when(repository.findById(1L))
        .thenReturn(Optional.of(product));
    
    Product result = service.getProduct(1L);
    
    assertNotNull(result);
    assertEquals("Laptop", result.getName());
}
```

**B. Assertion Failure:**
```java
// FAILED
expected: "Đăng nhập thành công"
actual: "Thành công"

// ROOT CAUSE:
// - Message khác với expected
// - Typo trong implementation

// FIX:
// Option 1: Fix test (nếu implementation đúng)
assertEquals("Thành công", response.getMessage());

// Option 2: Fix code (nếu test đúng)
return new LoginResponse(true, "Đăng nhập thành công", token);
```

**C. Mock không hoạt động:**
```java
// FAILED: verify() failed
// Wanted but not invoked:
repository.save(any());

// ROOT CAUSE:
// - Mock không được setup đúng
// - Method signature không match

// FIX:
// Kiểm tra mock setup
@BeforeEach
void setUp() {
    MockitoAnnotations.openMocks(this); // Important!
}

// Kiểm tra method signature
verify(repository).save(argThat(p -> 
    p.getName().equals("Laptop")
));
```

**3. Debug Strategy:**
```java
// Add logging
@Test
void testWithLogging() {
    System.out.println("Input: " + input);
    
    Product result = service.createProduct(input);
    
    System.out.println("Result: " + result);
    assertNotNull(result);
}

// Use debugger
// Set breakpoint at assertion
// Check variable values
```

**4. Common Fixes:**
- Add missing mocks
- Fix test data
- Update expectations
- Handle null cases
- Add precondition checks

**Câu 39:** Thiết kế một test suite hoàn chỉnh cho chức năng "Update Product". Bao gồm: test plan, test cases, test data, expected results.

**Đáp án mẫu:**

**TEST SUITE: Update Product**

**1. Test Plan:**

**Objective:** Verify Product Update functionality

**Scope:**
- In scope: Update name, price, quantity, description, category
- Out scope: Bulk update, concurrent updates

**Test Strategy:**
- Unit tests: Service layer validation
- Integration tests: Controller + Service
- Mock tests: Repository interactions

**Environment:**
- Spring Boot 3.5.6
- Java 21
- H2 in-memory database

**2. Test Cases:**

**TC_UPDATE_001: Update product thành công (CRITICAL)**
```java
@Test
@DisplayName("TC_UPDATE_001: Cập nhật sản phẩm thành công")
void testUpdateProduct_Success() {
    // Arrange
    Long productId = 1L;
    Product existing = new Product(1L, "Laptop", 15000000, 10);
    ProductDto update = new ProductDto(
        "Laptop Dell XPS", 18000000, 8
    );
    Product updated = new Product(
        1L, "Laptop Dell XPS", 18000000, 8
    );
    
    when(repository.findById(1L))
        .thenReturn(Optional.of(existing));
    when(repository.save(any()))
        .thenReturn(updated);
    
    // Act
    ProductDto result = service.updateProduct(productId, update);
    
    // Assert - State
    assertNotNull(result);
    assertEquals("Laptop Dell XPS", result.getName());
    assertEquals(18000000, result.getPrice());
    assertEquals(8, result.getQuantity());
    
    // Assert - Behavior
    verify(repository).findById(1L);
    verify(repository).save(any());
}
```

**TC_UPDATE_002: Product không tồn tại (HIGH)**
```java
@Test
@DisplayName("TC_UPDATE_002: Lỗi khi product không tồn tại")
void testUpdateProduct_NotFound() {
    // Arrange
    when(repository.findById(999L))
        .thenReturn(Optional.empty());
    
    ProductDto update = new ProductDto("Laptop", 15000000, 10);
    
    // Act & Assert
    NotFoundException exception = assertThrows(
        NotFoundException.class,
        () -> service.updateProduct(999L, update)
    );
    
    assertEquals("Product not found with id: 999", 
        exception.getMessage());
    
    verify(repository).findById(999L);
    verify(repository, never()).save(any());
}
```

**TC_UPDATE_003: Validation - Price âm (HIGH)**
```java
@Test
@DisplayName("TC_UPDATE_003: Lỗi khi price âm")
void testUpdateProduct_InvalidPrice() {
    // Arrange
    Product existing = new Product(1L, "Laptop", 15000000, 10);
    when(repository.findById(1L))
        .thenReturn(Optional.of(existing));
    
    ProductDto update = new ProductDto("Laptop", -1000, 10);
    
    // Act & Assert
    ValidationException exception = assertThrows(
        ValidationException.class,
        () -> service.updateProduct(1L, update)
    );
    
    assertEquals("Price must be greater than 0", 
        exception.getMessage());
    verify(repository, never()).save(any());
}
```

**TC_UPDATE_004: Validation - Quantity âm (MEDIUM)**
```java
@Test
@DisplayName("TC_UPDATE_004: Lỗi khi quantity âm")
void testUpdateProduct_InvalidQuantity() {
    Product existing = new Product(1L, "Laptop", 15000000, 10);
    when(repository.findById(1L))
        .thenReturn(Optional.of(existing));
    
    ProductDto update = new ProductDto("Laptop", 15000000, -5);
    
    ValidationException exception = assertThrows(
        ValidationException.class,
        () -> service.updateProduct(1L, update)
    );
    
    assertEquals("Quantity cannot be negative", 
        exception.getMessage());
}
```

**TC_UPDATE_005: Boundary - Name length (MEDIUM)**
```java
@Test
@DisplayName("TC_UPDATE_005: Name với độ dài maximum")
void testUpdateProduct_MaxNameLength() {
    String maxName = "L".repeat(100); // Max 100 chars
    
    Product existing = new Product(1L, "Laptop", 15000000, 10);
    ProductDto update = new ProductDto(maxName, 15000000, 10);
    Product updated = new Product(1L, maxName, 15000000, 10);
    
    when(repository.findById(1L))
        .thenReturn(Optional.of(existing));
    when(repository.save(any())).thenReturn(updated);
    
    ProductDto result = service.updateProduct(1L, update);
    
    assertEquals(100, result.getName().length());
}

@Test
@DisplayName("TC_UPDATE_006: Name quá dài - phải fail")
void testUpdateProduct_NameTooLong() {
    String tooLongName = "L".repeat(101); // Over 100
    
    Product existing = new Product(1L, "Laptop", 15000000, 10);
    ProductDto update = new ProductDto(tooLongName, 15000000, 10);
    
    when(repository.findById(1L))
        .thenReturn(Optional.of(existing));
    
    ValidationException exception = assertThrows(
        ValidationException.class,
        () -> service.updateProduct(1L, update)
    );
    
    assertEquals("Name must not exceed 100 characters", 
        exception.getMessage());
}
```

**TC_UPDATE_007: Partial update (LOW)**
```java
@Test
@DisplayName("TC_UPDATE_007: Chỉ cập nhật một số fields")
void testUpdateProduct_PartialUpdate() {
    Product existing = new Product(
        1L, "Laptop", 15000000, 10, "Old description"
    );
    
    // Chỉ update price
    ProductDto update = new ProductDto();
    update.setPrice(18000000);
    
    Product updated = new Product(
        1L, "Laptop", 18000000, 10, "Old description"
    );
    
    when(repository.findById(1L))
        .thenReturn(Optional.of(existing));
    when(repository.save(any())).thenReturn(updated);
    
    ProductDto result = service.updateProduct(1L, update);
    
    // Verify only price changed
    assertEquals("Laptop", result.getName()); // Unchanged
    assertEquals(18000000, result.getPrice()); // Changed
    assertEquals(10, result.getQuantity()); // Unchanged
}
```

**3. Test Data Matrix:**

| Test Case | Product ID | Name | Price | Quantity | Expected Result |
|-----------|------------|------|-------|----------|-----------------|
| TC_UPDATE_001 | 1 (exists) | "Laptop Dell XPS" | 18000000 | 8 | Success |
| TC_UPDATE_002 | 999 (not exist) | "Laptop" | 15000000 | 10 | NotFoundException |
| TC_UPDATE_003 | 1 (exists) | "Laptop" | -1000 | 10 | ValidationException |
| TC_UPDATE_004 | 1 (exists) | "Laptop" | 15000000 | -5 | ValidationException |
| TC_UPDATE_005 | 1 (exists) | 100 chars | 15000000 | 10 | Success |
| TC_UPDATE_006 | 1 (exists) | 101 chars | 15000000 | 10 | ValidationException |

**4. Integration Test:**
```java
@WebMvcTest(ProductController.class)
class ProductControllerUpdateTest {
    
    @Test
    void testUpdateProduct_API() throws Exception {
        ProductDto update = new ProductDto(
            "Laptop Dell", 18000000, 8
        );
        
        when(productService.updateProduct(eq(1L), any()))
            .thenReturn(update);
        
        mockMvc.perform(put("/api/products/1")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(update)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Laptop Dell"))
            .andExpect(jsonPath("$.price").value(18000000));
    }
}
```

**5. Coverage Goals:**
- Line coverage: >= 90%
- Branch coverage: >= 85%
- All validation paths covered
- All error scenarios tested

**Câu 40:** Đề xuất cải tiến test strategy cho cả project. Cần bổ sung loại tests nào? Làm thế nào để automate testing process?

**Đáp án mẫu:**

**TEST STRATEGY IMPROVEMENT PLAN**

**1. Current State Assessment:**

**Có:**
✅ Unit Tests (Service, Utils)
✅ Integration Tests (Controller + Service)
✅ Mock Tests (Mockito)

**Thiếu:**
❌ E2E Tests
❌ Performance Tests
❌ Security Tests
❌ Contract Tests
❌ Mutation Tests

**2. Proposed Test Pyramid:**

```
        /\
       /E2E\          10% - Few, slow, expensive
      /------\
     /Integ.  \       20% - Medium coverage
    /----------\
   / Unit Tests \     70% - Many, fast, cheap
  /--------------\
```

**3. Tests cần bổ sung:**

**A. E2E Tests (Selenium/Cypress):**
```java
// E2E Test Example
@Test
void testCompleteProductFlow() {
    // 1. Login
    driver.get("http://localhost:3000/login");
    driver.findElement(By.id("username")).sendKeys("admin");
    driver.findElement(By.id("password")).sendKeys("Admin123");
    driver.findElement(By.id("login-btn")).click();
    
    // 2. Navigate to Products
    driver.findElement(By.id("products-menu")).click();
    
    // 3. Create Product
    driver.findElement(By.id("add-product")).click();
    driver.findElement(By.id("name")).sendKeys("Laptop Dell");
    driver.findElement(By.id("price")).sendKeys("15000000");
    driver.findElement(By.id("save-btn")).click();
    
    // 4. Verify in list
    assertTrue(driver.getPageSource().contains("Laptop Dell"));
    
    // 5. Update
    driver.findElement(By.id("edit-1")).click();
    driver.findElement(By.id("price")).clear();
    driver.findElement(By.id("price")).sendKeys("18000000");
    driver.findElement(By.id("save-btn")).click();
    
    // 6. Delete
    driver.findElement(By.id("delete-1")).click();
    driver.findElement(By.id("confirm-delete")).click();
    
    // 7. Verify deleted
    assertFalse(driver.getPageSource().contains("Laptop Dell"));
}
```

**B. Performance Tests (JMeter/Gatling):**
```scala
// Gatling Load Test
class ProductLoadTest extends Simulation {
  
  val httpProtocol = http
    .baseUrl("http://localhost:8080")
    .header("Authorization", "Bearer ${token}")
  
  val scn = scenario("Product CRUD Load Test")
    .exec(http("Login")
      .post("/api/auth/login")
      .body(StringBody("""{"username":"admin","password":"Admin123"}"""))
      .check(jsonPath("$.token").saveAs("token")))
    
    .exec(http("Get Products")
      .get("/api/products")
      .check(status.is(200)))
    
    .exec(http("Create Product")
      .post("/api/products")
      .body(StringBody("""{"name":"Laptop","price":15000000}"""))
      .check(status.is(201)))
    
    .exec(http("Update Product")
      .put("/api/products/${productId}")
      .body(StringBody("""{"price":18000000}"""))
      .check(status.is(200)))
  
  setUp(
    scn.inject(
      rampUsers(100) during (10 seconds),  // 100 users in 10s
      constantUsersPerSec(20) during (60 seconds) // 20 req/s for 1min
    )
  ).protocols(httpProtocol)
  .assertions(
    global.responseTime.max.lt(1000),     // Max 1s
    global.successfulRequests.percent.gt(95) // 95% success
  )
}
```

**C. Security Tests (OWASP ZAP):**
```java
// Security Test Example
@Test
void testSQLInjection() {
    String maliciousInput = "'; DROP TABLE products; --";
    
    ProductDto product = new ProductDto(
        maliciousInput, 15000000, 10
    );
    
    // Should be sanitized, not execute SQL
    assertThrows(ValidationException.class,
        () -> service.createProduct(product));
}

@Test
void testXSS() {
    String xssPayload = "<script>alert('XSS')</script>";
    
    ProductDto product = new ProductDto(
        xssPayload, 15000000, 10
    );
    
    // Should be escaped
    ProductDto result = service.createProduct(product);
    assertFalse(result.getName().contains("<script>"));
}

@Test
void testUnauthorizedAccess() {
    mockMvc.perform(get("/api/products")
        .header("Authorization", "Bearer invalid-token"))
        .andExpect(status().isUnauthorized());
}
```

**D. Contract Tests (Pact):**
```java
// API Contract Test
@PactVerification(value = "ProductService")
@Test
void testProductContract() {
    // Verify API contract với frontend
    // Đảm bảo response structure không đổi
}
```

**E. Mutation Tests (PIT):**
```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.pitest</groupId>
    <artifactId>pitest-maven</artifactId>
    <configuration>
        <targetClasses>
            <param>com.flogin.service.*</param>
        </targetClasses>
        <targetTests>
            <param>com.flogin.*Test</param>
        </targetTests>
    </configuration>
</plugin>
```

**4. Automation Strategy:**

**A. CI/CD Pipeline (GitHub Actions):**
```yaml
name: Complete Test Pipeline

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup JDK
        uses: actions/setup-java@v3
        with:
          java-version: '21'
      
      - name: Run Unit Tests
        run: ./mvnw test
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
  
  integration-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    steps:
      - name: Run Integration Tests
        run: ./mvnw verify -P integration-tests
  
  e2e-tests:
    needs: integration-tests
    runs-on: ubuntu-latest
    steps:
      - name: Start Backend
        run: ./mvnw spring-boot:run &
      
      - name: Start Frontend
        run: npm start &
      
      - name: Run E2E Tests
        run: npm run cypress:run
  
  performance-tests:
    needs: e2e-tests
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Run Load Tests
        run: ./mvnw gatling:test
  
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: OWASP Dependency Check
        run: ./mvnw dependency-check:check
      
      - name: SonarQube Scan
        run: ./mvnw sonar:sonar
```

**B. Test Execution Matrix:**

| Environment | Unit | Integration | E2E | Performance | Security |
|-------------|------|-------------|-----|-------------|----------|
| Dev commit | ✅ | ❌ | ❌ | ❌ | ❌ |
| Pull Request | ✅ | ✅ | ❌ | ❌ | ✅ |
| Merge to main | ✅ | ✅ | ✅ | ❌ | ✅ |
| Nightly build | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pre-release | ✅ | ✅ | ✅ | ✅ | ✅ |

**C. Test Data Management:**
```java
// TestDataBuilder pattern
public class ProductTestDataBuilder {
    private String name = "Default Product";
    private Integer price = 10000;
    private Integer quantity = 10;
    
    public ProductTestDataBuilder withName(String name) {
        this.name = name;
        return this;
    }
    
    public ProductTestDataBuilder withPrice(Integer price) {
        this.price = price;
        return this;
    }
    
    public Product build() {
        return new Product(name, price, quantity);
    }
}

// Usage in tests
@Test
void test() {
    Product product = new ProductTestDataBuilder()
        .withName("Laptop")
        .withPrice(15000000)
        .build();
}
```

**D. Parallel Test Execution:**
```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <parallel>classes</parallel>
        <threadCount>4</threadCount>
    </configuration>
</plugin>
```

**5. Quality Gates:**
```yaml
quality_gates:
  unit_test_coverage: 85%
  integration_test_coverage: 70%
  mutation_test_score: 75%
  max_response_time: 1000ms
  success_rate: 99%
  security_vulnerabilities: 0 critical
```

**6. Monitoring & Reporting:**
- Allure Reports for test results
- JaCoCo for coverage
- SonarQube for code quality
- Grafana for performance metrics

---

# **TÓM TẮT ĐIỂM SỐ**

## **Phần A - Backend Source (20 câu = 40 điểm)**
- Nhận biết: 5 câu × 1 điểm = 5 điểm
- Thông hiểu: 12 câu × 2 điểm = 24 điểm
- Vận dụng: 3 câu × 3 điểm = 9 điểm (cộng 2 điểm bonus về chiều sâu)

## **Phần B - Test Cases (20 câu = 40 điểm)**
- Nhận biết: 5 câu × 1 điểm = 5 điểm
- Thông hiểu: 12 câu × 2 điểm = 24 điểm
- Vận dụng: 3 câu × 3 điểm = 9 điểm (cộng 2 điểm bonus về chiều sâu)

**Tổng: 40 câu = 80 điểm + 4 điểm bonus = 84 điểm**