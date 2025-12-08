## **PHẦN A: CÂU HỎI VỀ LUỒNG XỬ LÝ BACKEND (6 câu)**

### **1. Luồng xử lý JWT Filter trong Security**
**Câu hỏi:** Em hãy giải thích chi tiết luồng hoạt động của `JwtFilter` trong file `JwtFilter.java`. Cụ thể:
- Filter này được kích hoạt ở đâu trong chuỗi xử lý request?
- Tại sao em extends `OncePerRequestFilter`? 
- Khi nào thì `SecurityContextHolder.getContext().setAuthentication(authToken)` được gọi?
- Trong dòng 35, em khởi tạo `new ArrayList<>()` cho authorities - tại sao lại để trống? Điều này ảnh hưởng gì đến authorization?

**Trả lời:**

Dạ, về JwtFilter của em thì nó hoạt động như sau ạ:

**Vị trí kích hoạt:** Filter này được em đăng ký trong `SecurityConfig.java` ở dòng 30 bằng cách `.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)`. Nghĩa là nó sẽ chạy trước cái `UsernamePasswordAuthenticationFilter` của Spring Security. Cụ thể là mỗi khi có request đến, nó sẽ đi qua chuỗi filter chain của Spring Security, và JwtFilter của em nằm ở vị trí đầu tiên để kiểm tra token.

**Tại sao extends OncePerRequestFilter:** Em dùng `OncePerRequestFilter` vì như tên gọi của nó ấy ạ - nó đảm bảo filter chỉ chạy đúng 1 lần cho mỗi request. Thầy biết đấy, đôi khi trong Spring một request có thể đi qua cùng một filter nhiều lần do forward hay include, nhưng với `OncePerRequestFilter` thì em chắc chắn logic verify token của em chỉ chạy 1 lần thôi, không bị duplicate.

**Khi nào setAuthentication được gọi:** Cái `SecurityContextHolder.getContext().setAuthentication(authToken)` ở dòng 37 chỉ được gọi khi 2 điều kiện thỏa mãn:
1. Request phải có header Authorization và bắt đầu bằng "Bearer " (check ở dòng 28)
2. Token phải valid (check ở dòng 31 với `jwtTokenProvider.validateToken(jwt)`)

Nếu 2 cái này ok thì em mới set authentication vào SecurityContext để Spring Security biết là user này đã authenticated rồi.

**Về ArrayList rỗng cho authorities:** Ở dòng 35, em truyền `new ArrayList<>()` vào constructor của `UsernamePasswordAuthenticationToken` là vì:
- Constructor này nhận 3 tham số: principal (username), credentials (password - em để null vì đã verify rồi), và authorities (quyền hạn)
- Em để ArrayList rỗng vì trong project này em chưa implement role-based authorization (RBAC). Em chỉ cần biết user đã login hay chưa thôi, chưa phân quyền Admin/User gì cả.
- Điều này ảnh hưởng là: nếu em dùng `@PreAuthorize("hasRole('ADMIN')")` thì sẽ không work, vì authorities list rỗng. Nhưng với `@PreAuthorize("isAuthenticated()")` như em dùng trong `@RequireAuth` thì vẫn ok vì chỉ cần check có authenticated hay không thôi.

### **2. GlobalExceptionHandler - Cơ chế bắt lỗi tự động**
**Câu hỏi:** Em giải thích cơ chế hoạt động của GlobalExceptionHandler.java:
- Tại sao không cần gọi GlobalExceptionHandler trong main() mà nó vẫn tự động bắt được exception từ Service/Controller?
- `@RestControllerAdvice` khác gì với `@ControllerAdvice`? Tại sao em chọn annotation này?
- Khi một exception được throw từ `AuthService.authenticate()` (dòng 32-33), nó đi qua những tầng nào trước khi đến GlobalExceptionHandler?
- Tại sao `handleAuth()` trả về `ResponseEntity<LoginResponse>` trong khi các handler khác trả về `ResponseEntity<ErrorResponse>`?

**Trả lời:**

Dạ, về GlobalExceptionHandler thì em giải thích như sau ạ:

**Tại sao tự động bắt được exception:** Đây là cơ chế của Spring Boot ạ thầy. Khi em đánh annotation `@RestControllerAdvice` lên class, Spring Boot sẽ tự động scan và đăng ký class này như một "global exception handler" cho toàn bộ application. Nó giống như AOP (Aspect Oriented Programming) vậy ạ - Spring sẽ wrap tất cả các Controller methods và khi có exception throw ra thì nó sẽ intercept và route đến các `@ExceptionHandler` methods tương ứng. Em không cần phải manually inject hay gọi nó trong main() vì Spring Container đã tự động quản lý rồi.

**@RestControllerAdvice vs @ControllerAdvice:** 
- `@ControllerAdvice` là annotation cơ bản, nó bắt exception và trả về view (HTML page)
- `@RestControllerAdvice` = `@ControllerAdvice` + `@ResponseBody`, nghĩa là nó tự động serialize response thành JSON
- Em chọn `@RestControllerAdvice` vì project em là REST API, cần trả về JSON response chứ không phải HTML page. Nếu em dùng `@ControllerAdvice` thì phải thêm `@ResponseBody` vào từng method handler, rườm rà hơn.

**Luồng exception từ Service đến GlobalExceptionHandler:** Khi exception được throw ở `AuthService.authenticate()`, nó đi qua các tầng này:
1. AuthService.authenticate() throw exception (ví dụ `NotFoundException`)
2. Exception bubble up về LoginController.login() method
3. LoginController không catch nên nó tiếp tục bubble up
4. DispatcherServlet (core của Spring MVC) catch exception này
5. DispatcherServlet check xem có HandlerExceptionResolver nào handle được không
6. GlobalExceptionHandler (là một HandlerExceptionResolver) được Spring tìm thấy
7. Spring match exception type với các `@ExceptionHandler` methods
8. Method tương ứng được gọi (ví dụ `handleNotFound()` cho NotFoundException)
9. Response được trả về client

**Tại sao handleAuth() trả về LoginResponse:** Đây là design decision của em ạ thầy. Em thấy các error khác như NotFoundException, ExistsException thì format response chung là `ErrorResponse(statusCode, message)`. Nhưng với AuthException thì em muốn response format giống như success response của login để frontend xử lý dễ hơn. Cụ thể là LoginResponse có structure `{success: false, message: "...", token: null, userResponse: null}`. Như vậy frontend chỉ cần check field `success` là biết ngay login ok hay fail, không cần phải check status code riêng. Em nghĩ cách này consistent hơn cho auth flow.

### **3. Luồng Authentication từ Request đến Response**
**Câu hỏi:** Trace toàn bộ luồng xử lý khi user gửi POST request đến `/auth/login`:
- Request đi qua những Filter nào trong Spring Security? Thứ tự ra sao?
- Tại sao trong SecurityConfig.java dòng 34 có `requestMatchers("/auth/**").permitAll()` nhưng JwtFilter vẫn chạy?
- Sau khi `AuthService.authenticate()` thành công, token được tạo bởi `JwtTokenProvider.generateToken()` - token này được lưu ở đâu (server hay client)?
- Nếu login thất bại, exception được throw ở Service layer, làm sao response về đúng HTTP status code (401, 404)?

**Trả lời:**

Dạ, em trace luồng authentication như sau ạ:

**Filter chain khi POST /auth/login:**
1. **CorsFilter** - xử lý CORS configuration trước (em config trong SecurityConfig)
2. **JwtFilter** - filter của em, check xem có token không (nhưng với /auth/login thì thường không có)
3. **UsernamePasswordAuthenticationFilter** - filter mặc định của Spring Security (nhưng em không dùng)
4. **FilterSecurityInterceptor** - check authorization rules (permitAll, authenticated, etc.)
5. Sau đó request mới đến **DispatcherServlet** và vào LoginController

Thứ tự này được Spring Security setup theo default chain, nhưng em đã customize bằng cách add JwtFilter vào trước UsernamePasswordAuthenticationFilter.

**Tại sao JwtFilter vẫn chạy dù có permitAll:** Đây là điểm quan trọng ạ thầy! `permitAll()` chỉ ảnh hưởng đến **authorization** (có được phép access không), chứ không ảnh hưởng đến **filter chain**. 

Cụ thể:
- JwtFilter vẫn chạy để parse token (nếu có), nhưng nếu không có token thì nó chỉ skip và gọi `filterChain.doFilter()` tiếp
- Sau đó đến FilterSecurityInterceptor, nó check `.requestMatchers("/auth/**").permitAll()` và cho phép request đi qua dù user chưa authenticated
- Nếu endpoint khác như `/products/**` có `@RequireAuth` mà user chưa authenticated thì FilterSecurityInterceptor sẽ block lại

Tóm lại: Filter chain vẫn chạy đầy đủ, nhưng authorization check sẽ pass do permitAll.

**Token được lưu ở đâu:** Token được lưu ở **client** (browser) ạ thầy, không lưu ở server. Cụ thể:
- Sau khi `JwtTokenProvider.generateToken()` tạo token thành công
- Token được trả về trong LoginResponse: `{success: true, token: "eyJhbGc...", ...}`
- Frontend nhận được token và lưu vào localStorage hoặc sessionStorage của browser
- Mỗi lần call API sau đó, frontend phải gửi token trong header: `Authorization: Bearer eyJhbGc...`
- Server (JwtFilter) sẽ verify token mỗi request nhưng không lưu trữ gì cả

Đây là stateless authentication - server không lưu session, chỉ verify signature của JWT.

**Status code khi login fail:** Exception từ Service sẽ match với status code trong GlobalExceptionHandler:
- `NotFoundException` (user không tồn tại) → `handleNotFound()` → HttpStatus.NOT_FOUND (404)
- `AuthException` (sai password) → `handleAuth()` → `ex.getHttpStatus()` là UNAUTHORIZED (401)

Em đã custom AuthException có field `httpStatus` để flexible trong việc set status code. Khi throw exception, em truyền status code vào: `throw new AuthException("Mật khẩu không chính xác", HttpStatus.UNAUTHORIZED)`, và trong GlobalExceptionHandler em lấy ra bằng `ex.getHttpStatus()`.

### **4. Annotation @RequireAuth hoạt động thế nào?**
**Câu hỏi:** Em đã tạo custom annotation `@RequireAuth` và sử dụng trong `ProductController`:
- `@PreAuthorize("isAuthenticated()")` hoạt động như thế nào? Ai kiểm tra điều kiện này?
- Nếu user chưa authenticated mà gọi API product, exception nào được throw? Có đi qua GlobalExceptionHandler không?
- Tại sao em không dùng trực tiếp `@PreAuthorize` mà phải tạo custom annotation?
- Luồng xử lý khác gì giữa endpoint có `@RequireAuth` và endpoint có `.permitAll()`?

**Trả lời:**

Dạ, về @RequireAuth của em thì:

**Cơ chế hoạt động của @PreAuthorize:** 
- `@PreAuthorize("isAuthenticated()")` là một phần của Spring Security's Method Security
- Em đã enable nó bằng `@EnableMethodSecurity` trong SecurityConfig (dòng 20)
- Khi có annotation này, Spring sẽ tạo một **AOP proxy** wrap quanh Controller/Service methods
- Trước khi vào method thực tế, proxy sẽ evaluate expression `"isAuthenticated()"`
- **Ai kiểm tra:** `MethodSecurityInterceptor` của Spring Security sẽ check SecurityContext xem có Authentication object không
- Nếu SecurityContext.getAuthentication() != null và isAuthenticated() = true thì cho vào method
- Nếu không thì throw `AccessDeniedException`

**Exception khi chưa authenticated:**
- Exception được throw là: `AccessDeniedException` từ Spring Security
- Exception này **KHÔNG đi qua GlobalExceptionHandler** của em vì:
  - Nó được throw trước khi request vào Controller (ở tầng AOP interceptor)
  - GlobalExceptionHandler chỉ bắt exception từ Controller/Service layer
  - AccessDeniedException được handle bởi Spring Security's `ExceptionTranslationFilter`
  - Default sẽ trả về 403 Forbidden (hoặc 401 nếu chưa authenticated)

Đây là một limitation trong design của em. Nếu muốn custom response cho trường hợp này, em cần thêm `AccessDeniedHandler` trong SecurityConfig.

**Tại sao tạo custom annotation:**
Đây là best practice ạ thầy! Lý do:
1. **DRY principle** - thay vì viết `@PreAuthorize("isAuthenticated()")` ở mọi nơi, em chỉ cần `@RequireAuth`
2. **Semantic meaning** - nhìn vào `@RequireAuth` thì hiểu ngay là "cần đăng nhập", còn `@PreAuthorize("isAuthenticated()")` thì phải đọc expression
3. **Easy to change** - nếu sau này em muốn đổi logic (ví dụ thêm điều kiện hasRole('USER')), em chỉ cần sửa ở 1 chỗ (trong RequireAuth.java) thay vì search & replace toàn bộ codebase
4. **Type safety** - annotation có type check, expression string thì không

**Luồng xử lý khác nhau:**

*Endpoint với .permitAll() (ví dụ /auth/login):*
1. Request → Filter Chain → JwtFilter (skip nếu không có token)
2. → FilterSecurityInterceptor check permitAll → **PASS ngay**
3. → DispatcherServlet → Controller method
4. → Return response

*Endpoint với @RequireAuth (ví dụ /products):*
1. Request → Filter Chain → JwtFilter → parse token & set Authentication vào SecurityContext
2. → FilterSecurityInterceptor check `.permitAll()` cho /products/** → PASS (vì em config permitAll trong SecurityConfig dòng 36)
3. → DispatcherServlet route đến ProductController
4. → **AOP Interceptor check @RequireAuth** → evaluate `isAuthenticated()`
5. → Nếu SecurityContext có Authentication → PASS → vào method
6. → Nếu không → throw AccessDeniedException → 403 response

Điểm khác biệt: permitAll check ở Filter level, @RequireAuth check ở Method level (AOP).

### **5. Luồng Validation với @Valid**
**Câu hỏi:** Trong LoginController.java dòng 27, em dùng `@Valid @RequestBody LoginRequest`:
- Validation xảy ra ở đâu trong request lifecycle? Trước hay sau khi vào Controller method?
- Khi validation fail, exception `MethodArgumentNotValidException` được throw - ai throw exception này?
- Trong GlobalExceptionHandler.java dòng 21, em lấy message bằng `getAllErrors().getFirst().getDefaultMessage()` - message này được định nghĩa ở đâu?
- Nếu em không có `@ExceptionHandler(MethodArgumentNotValidException.class)`, điều gì sẽ xảy ra?

**Trả lời:**

Dạ, về validation flow thì:

**Validation xảy ra ở đâu:**
Validation xảy ra **TRƯỚC** khi vào Controller method ạ thầy. Cụ thể:
1. Request đến DispatcherServlet
2. DispatcherServlet tìm được LoginController.login() method
3. Trước khi gọi method, Spring MVC cần bind request body JSON thành LoginRequest object
4. **Quá trình này được handle bởi `RequestResponseBodyMethodProcessor`**
5. Processor thấy annotation `@Valid` → trigger validation
6. Nó sử dụng **Hibernate Validator** (implementation của Bean Validation API) để validate object
7. Check tất cả constraints trong LoginRequest (ví dụ `@NotBlank`, `@Size`, `@Pattern`)
8. Nếu valid → pass object vào method parameter
9. Nếu invalid → throw `MethodArgumentNotValidException` ngay lập tức, method không được gọi

**Ai throw exception:**
`RequestResponseBodyMethodProcessor` của Spring MVC throw exception này. Cụ thể:
- Nó call `Validator.validate(loginRequest)` 
- Nhận về một Set<ConstraintViolation>
- Nếu set không empty → tạo BindingResult chứa errors
- Throw `MethodArgumentNotValidException(MethodParameter, BindingResult)`

Đây là built-in behavior của Spring MVC, không phải em throw manually.

**Message được định nghĩa ở đâu:**
Message được định nghĩa trong LoginRequest class ạ. Ví dụ:
```java
public class LoginRequest {
    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    private String username;
    
    @NotBlank(message = "Password không được để trống")
    @Size(min = 6, max = 100, message = "Password phải từ 6-100 ký tự")
    private String password;
}
```

Khi validation fail:
- Hibernate Validator tạo ConstraintViolation với defaultMessage là string trong annotation
- Spring MVC wrap nó thành FieldError trong BindingResult
- Em gọi `getAllErrors().getFirst().getDefaultMessage()` để lấy message đầu tiên

**Nếu không có @ExceptionHandler:**
Nếu em không handle `MethodArgumentNotValidException`, điều xảy ra:
1. Spring MVC's default exception handling sẽ kick in
2. `DefaultHandlerExceptionResolver` sẽ catch nó
3. Trả về response với:
   - Status: **400 Bad Request** (đúng)
   - Body: Default error response của Spring Boot, format như này:
```json
{
  "timestamp": "2025-12-02T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for object='loginRequest'...",
  "path": "/auth/login",
  "errors": [
    {
      "field": "username",
      "defaultMessage": "Username không được để trống",
      "code": "NotBlank"
    }
  ]
}
```

Response structure này:
- Rất verbose, có nhiều thông tin không cần thiết
- Không consistent với ErrorResponse format của em
- Frontend khó parse vì structure khác với các error khác

Vì vậy em tạo custom handler để:
- Extract only message: `getAllErrors().getFirst().getDefaultMessage()`
- Trả về consistent format: `ErrorResponse(400, message)`
- Đơn giản hơn cho frontend xử lý

### **6. Transaction và Repository Pattern**
**Câu hỏi:** Em giải thích về data flow trong Product CRUD:
- Trong `ProductService.update()`, tại sao em cần gọi `getById(id)` trước khi update? Có cách nào tối ưu hơn không?
- Khi `repo.save()` được gọi trong dòng 52 của ProductService.java, transaction bắt đầu và kết thúc ở đâu? 
- Nếu có exception xảy ra sau khi `repo.save()` nhưng trước khi method return, data có bị rollback không?
- Tại sao em không cần khai báo `@Transactional` trong ProductService?

**Trả lời:**

Dạ, về transaction và repository:

**Tại sao gọi getById() trước:**
Em gọi `getById(id)` ở dòng 43 trước khi update vì 2 lý do:
1. **Kiểm tra tồn tại**: Đảm bảo product với id đó có trong database. Nếu không có thì throw `NotFoundException` ngay, không cần query tiếp
2. **Lấy entity hiện tại**: Em cần entity cũ để:
   - So sánh tên cũ vs tên mới (dòng 46): nếu tên không đổi thì không cần check duplicate
   - Update partial fields: em dùng `ProductMapper.updateEntity(entity, req)` để update chỉ những field được gửi lên, giữ nguyên các field khác

**Có cách tối ưu hơn không?** Có ạ, em có thể:
- Dùng `@Modifying @Query` để update trực tiếp bằng JPQL:
```java
@Modifying
@Query("UPDATE ProductEntity p SET p.name = :name, p.price = :price WHERE p.id = :id")
int updateProduct(@Param("id") Long id, @Param("name") String name, ...);
```
Cách này chỉ 1 query thay vì 2 (SELECT + UPDATE), nhưng:
- Phức tạp hơn khi có nhiều field
- Mất đi validation logic (check duplicate name)
- Không có entity object để return về

Với use case của em (cần validation + return full entity), cách hiện tại hợp lý hơn.

**Transaction bắt đầu và kết thúc ở đâu:**
Đây là điểm hay ạ thầy! Với Spring Data JPA:
- **Transaction bắt đầu**: Khi vào method của Repository (ví dụ `repo.save()`)
- **Transaction kết thúc**: Khi method repository return
- Cụ thể với `repo.save()` ở dòng 52:
  1. JpaRepository's save() method có `@Transactional` default
  2. Spring tạo proxy wrap quanh repo
  3. Proxy mở transaction
  4. Execute: `entityManager.merge(entity)` hoặc `persist()`
  5. **Transaction commit** ngay khi save() return
  6. Changes được flush xuống database

Vậy nên transaction rất ngắn, chỉ trong scope của save() method thôi.

**Exception sau save() có rollback không:**
**KHÔNG** rollback ạ thầy! Đây là điểm nguy hiểm:
```java
public ProductEntity update(Long id, ProductRequest req) {
    ProductEntity entity = getById(id);
    ProductMapper.updateEntity(entity, req);
    ProductEntity saved = repo.save(entity);  // Transaction commit ở đây
    
    // Giả sử có exception ở đây
    if (saved.getPrice().compareTo(BigDecimal.ZERO) < 0) {
        throw new RuntimeException("Invalid price");
    }
    
    return saved;  // Chưa kịp return thì exception
}
```

Nếu exception xảy ra sau dòng `repo.save()`:
- Transaction của save() đã commit rồi
- Data đã được persist vào database
- Exception throw ra nhưng không rollback được nữa
- Client nhận 500 error nhưng data đã bị modify

**Tại sao không cần @Transactional trong Service:**
Em không khai báo vì:
1. **SimpleJpaRepository** (implementation của JpaRepository) đã có `@Transactional(readOnly = true)` ở class level
2. Các method như `save()`, `delete()` override lại với `@Transactional` (không readOnly)
3. Mỗi repository call tự quản lý transaction của nó

**Nhưng đây là LIMITATION** của code em ạ thầy! Best practice nên:
```java
@Transactional
public ProductEntity update(Long id, ProductRequest req) {
    ProductEntity entity = getById(id);
    
    if (!entity.getName().equals(req.getName()) && repo.existsByName(req.getName()))
        throw new ExistsException("Tên sản phẩm đã tồn tại");
    
    ProductMapper.updateEntity(entity, req);
    return repo.save(entity);
}
```

Với `@Transactional` ở service level:
- Transaction bao toàn bộ method
- Nếu có exception bất kỳ đâu thì rollback hết
- Có thể kết hợp nhiều repo calls trong 1 transaction
- Đảm bảo atomicity cho business logic phức tạp

Em sẽ cải thiện điểm này trong lần refactor sau ạ!

---

## **PHẦN B: CÂU HỎI VỀ KIỂM THỬ (20 câu)**

### **A. Unit Testing (5 câu)**

### **7. Fake Repository vs Real Repository**
**Câu hỏi:** Trong AuthServiceTest.java, em tạo `BaseFakeUserRepository`:
- Tại sao em không dùng `@Mock` mà lại tự tạo fake implementation?
- So sánh ưu/nhược điểm giữa Fake Repository và Mock Repository trong unit test?
- Trong fake implementation, em hardcode data như "hyan123" - điều này ảnh hưởng gì đến test maintainability?

**Trả lời:**

**Tại sao dùng Fake thay vì Mock:**
Em chọn Fake Repository vì muốn test theo **state-based testing** thay vì **interaction-based testing** ạ thầy. Cụ thể:

Với Mock (interaction-based):
```java
when(userRepo.findByUsername("hyan123")).thenReturn(Optional.of(user));
```
- Test verify "method có được gọi đúng không"
- Không có state thật, chỉ stub behavior

Với Fake (state-based):
```java
// Fake repo có list users thật, có logic thật
fakeUserRepository = new BaseFakeUserRepository() {
    @Override
    public Optional<UserEntity> findByUsername(String username) {
        if ("hyan123".equals(username))
            return Optional.of(fakeUser);
        return Optional.empty();
    }
};
```
- Test verify "kết quả có đúng không"
- Có state thật (list users), hành vi giống production

Em thấy với Unit test cho Service layer, state-based test rõ ràng hơn vì em test business logic, không care repository được gọi bao nhiêu lần.

**So sánh ưu/nhược điểm:**

*Fake Repository:*
- ✅ **Ưu điểm:**
  - Realistic behavior: logic giống repo thật (check tồn tại, filter, etc.)
  - Test được complex scenarios: nhiều users, query conditions phức tạp
  - Không cần setup stub cho từng test case
  - Easy to debug: có thể print fake data, check state
- ❌ **Nhược điểm:**
  - Phải viết nhiều code hơn (implement toàn bộ interface)
  - Nếu interface thay đổi, phải update fake
  - Khó maintain nếu có nhiều repository

*Mock Repository:*
- ✅ **Ưu điểm:**
  - Quick setup: chỉ cần `when().thenReturn()`
  - Verify interactions: biết chính xác method nào được gọi
  - Không cần implement full interface
- ❌ **Nhược điểm:**
  - Brittle tests: nếu refactor code (thay đổi cách gọi repo), test break
  - Phải stub từng scenario: nhiều `when().thenReturn()`
  - Không test được behavior của repository

**Hardcode data ảnh hưởng đến maintainability:**
Đây là trade-off ạ thầy:

*Vấn đề:*
- Hardcode "hyan123" nghĩa là test phụ thuộc vào magic string
- Nếu em cần test với user khác, phải tạo thêm fake user mới
- Khó tái sử dụng fake repo cho nhiều test class khác nhau

*Giải pháp tốt hơn em có thể làm:*
```java
public class InMemoryUserRepository extends BaseFakeUserRepository {
    private Map<String, UserEntity> users = new HashMap<>();
    
    public void addUser(UserEntity user) {
        users.put(user.getUsername(), user);
    }
    
    @Override
    public Optional<UserEntity> findByUsername(String username) {
        return Optional.ofNullable(users.get(username));
    }
}

// Trong test:
@BeforeEach
void setUp() {
    fakeUserRepo = new InMemoryUserRepository();
    fakeUserRepo.addUser(fakeUser);  // Add test data động
}
```

Cách này:
- Flexible: mỗi test có thể add data khác nhau
- Reusable: dùng lại InMemoryUserRepository cho nhiều test
- Không hardcode: data được inject qua addUser()

Nhưng trong project của em, vì scope nhỏ nên em chấp nhận hardcode để đơn giản. Trong project lớn thì nên dùng cách trên hoặc dùng test framework như TestContainers với database thật.

### **8. Fake PasswordEncoder Implementation**
**Câu hỏi:** Trong AuthServiceTest.java dòng 33-42, em tạo fake PasswordEncoder:
- Tại sao logic encode là `rawPassword.toString() + "_encoded"` thay vì dùng BCrypt thật?
- Nếu production code đổi sang SHA-256, unit test này có fail không? Có phát hiện được bug không?
- Em có test coverage cho edge case như password null/empty trong fake encoder không?

**Trả lời:**

**Tại sao không dùng BCrypt thật:**
Em dùng fake PasswordEncoder với logic đơn giản `rawPassword + "_encoded"` vì:

1. **Performance**: BCrypt rất chậm (by design để chống brute force), mỗi lần encode mất ~100-300ms. Với nhiều test cases, thời gian chạy test sẽ tăng vọt. Fake encoder chạy instant.

2. **Deterministic**: BCrypt mỗi lần encode cùng password cho kết quả khác nhau (vì random salt). Trong test em cần:
```java
fakeUser.setPassword("password123_encoded");
// Sau đó verify
assertTrue(encoder.matches("password123", user.getPassword()));
```
Với fake encoder, em biết chắc output là gì, dễ setup test data.

3. **Unit test isolation**: Unit test chỉ nên test logic của AuthService (check user tồn tại, verify password match). Việc BCrypt hoạt động đúng là responsibility của thư viện Spring Security, không phải của em. Đó là integration concern, không phải unit concern.

4. **Test focus**: Em muốn test business logic:
   - User không tồn tại → NotFoundException
   - Password sai → AuthException
   - Password đúng → return LoginResponse với token

Encoder thật hay fake không ảnh hưởng đến logic này.

**Nếu production đổi sang SHA-256:**
Unit test này **KHÔNG FAIL** và **KHÔNG PHÁT HIỆN BUG** ạ thầy! Đây là limitation lớn:

```java
// Production code đổi
@Bean
public PasswordEncoder passwordEncoder() {
    return new SHA256PasswordEncoder();  // Đổi từ BCrypt
}

// Nhưng unit test vẫn pass vì:
fakePasswordEncoder = new PasswordEncoder() {
    @Override
    public boolean matches(CharSequence raw, String encoded) {
        return (raw.toString() + "_encoded").equals(encoded);
    }
};
```

Test vẫn pass vì nó dùng fake encoder, không care production encoder đổi gì. Đây là điểm yếu của unit test với fake dependencies.

**Giải pháp:**
- **Integration test**: Test với PasswordEncoder thật trong `AuthControllerTest` (integration)
- **Contract test**: Verify rằng PasswordEncoder bean được inject đúng type
- **E2E test**: Test toàn bộ flow login với password encoding thật

Vậy nên em có cả 3 levels: Unit (fake) + Integration (real) + E2E.

**Test coverage cho null/empty password:**
Em **CHƯA** có test case cho edge case này trong fake encoder ạ thầy. Đây là gap trong test của em:

```java
// Em nên thêm:
@Test
void testEncodeNullPassword() {
    assertThrows(NullPointerException.class, () -> {
        authService.authenticate(new LoginRequest("user", null));
    });
}

@Test  
void testEncodeEmptyPassword() {
    LoginRequest req = new LoginRequest("user", "");
    // Validation sẽ catch này trước khi đến encoder
    assertThrows(MethodArgumentNotValidException.class, ...);
}
```

Nhưng thực tế:
- Null/empty password được catch bởi `@Valid` validation ở Controller layer (NotBlank constraint)
- Nó không bao giờ đến được AuthService.authenticate()
- Vậy nên trong unit test AuthService, em assume input đã valid rồi

Đây là **test pyramid**: validation được test ở Controller integration test, còn Service unit test assume happy path với valid input.

### **9. Test Isolation và Independence**
**Câu hỏi:** Phân tích test isolation trong ProductServiceTest.java:
- Trong `setUp()`, em khởi tạo `fakeProducts` với 2 items cố định - nếu một test thêm product, test sau có bị ảnh hưởng không?
- Em có reset state giữa các test như thế nào?
- Nếu chạy test song song (parallel execution), fake repository có thread-safe không?

**Trả lời:**

**Test có bị ảnh hưởng không:**
**CÓ** ảnh hưởng ạ thầy, nhưng em đã handle bằng JUnit lifecycle:

```java
@BeforeEach
void setUp() {
    fakeProduct1 = ProductEntity.builder()...build();
    fakeProduct2 = ProductEntity.builder()...build();
    
    fakeProducts = new ArrayList<>();  // Tạo MỚI ArrayList
    fakeProducts.add(fakeProduct1);
    fakeProducts.add(fakeProduct2);
    // ...
}
```

Nhờ `@BeforeEach`, JUnit tự động:
1. Gọi setUp() **TRƯỚC MỖI** test method
2. Tạo lại instance variables mới (fakeProducts, fakeProductRepository)
3. State được reset về initial

Ví dụ:
```java
@Test
void test1_CreateProduct() {
    // fakeProducts ban đầu: [product1, product2]
    productService.create(newProduct);
    // fakeProducts bây giờ: [product1, product2, newProduct]
}

@Test
void test2_GetAll() {
    // setUp() chạy lại → fakeProducts reset: [product1, product2]
    List<ProductEntity> all = productService.getAll();
    assertEquals(2, all.size());  // PASS vì đã reset
}
```

**Nếu em KHÔNG có @BeforeEach**, test sẽ bị ảnh hưởng:
- test1 thêm product → size = 3
- test2 expect size = 2 → FAIL
- Test order dependent → flaky tests

**Reset state như thế nào:**
Em reset state bằng cách:

1. **@BeforeEach tạo mới objects**: Không reuse objects cũ
```java
fakeProducts = new ArrayList<>();  // NEW instance
productService = new ProductService(fakeProductRepository);  // NEW service
```

2. **Immutable test data**: fakeProduct1, fakeProduct2 được tạo mới mỗi lần
```java
fakeProduct1 = ProductEntity.builder()  // Builder tạo object mới
    .id(1L)
    .name("...")
    .build();
```

3. **No static state**: Em không dùng static variables nào cả, tránh shared state giữa tests

4. **Repository implementation reset**: Fake repository có logic:
```java
@Override
public <S extends ProductEntity> S save(S entity) {
    if (entity.getId() == null) {
        entity.setId(nextId++);
        fakeProducts.add(entity);  // Modify list hiện tại
    }
    return entity;
}
```
Vì fakeProducts được tạo mới mỗi test, nên modifications không leak sang test khác.

**Thread-safety khi chạy parallel:**
**KHÔNG** thread-safe ạ thầy! Fake repository của em có nhiều race conditions:

```java
private List<ProductEntity> fakeProducts;
private Long nextId = 3L;

public <S extends ProductEntity> S save(S entity) {
    if (entity.getId() == null) {
        entity.setId(nextId++);  // ❌ NOT atomic
        fakeProducts.add(entity);  // ❌ ArrayList not thread-safe
    }
    return entity;
}
```

Nếu 2 tests chạy đồng thời:
- Thread 1: read nextId = 3, assign id = 3
- Thread 2: read nextId = 3 (chưa kịp increment), assign id = 3
- Thread 1: nextId++, nextId = 4
- Thread 2: nextId++, nextId = 5
- **Kết quả**: 2 products cùng id = 3 → duplicate key!

**Giải pháp nếu cần parallel:**
```java
private List<ProductEntity> fakeProducts = new CopyOnWriteArrayList<>();
private AtomicLong nextId = new AtomicLong(3);

public <S extends ProductEntity> S save(S entity) {
    if (entity.getId() == null) {
        entity.setId(nextId.getAndIncrement());  // ✅ Atomic
        fakeProducts.add(entity);  // ✅ Thread-safe list
    }
    return entity;
}
```

Nhưng trong project em:
- JUnit default chạy tests **sequentially** (từng cái một)
- Mỗi test có isolated instance (không share fakeRepository)
- Vậy nên không cần thread-safety

Nếu enable parallel execution (`@Execution(ExecutionMode.CONCURRENT)`), em phải refactor fake repo.

### **10. Test Behavior vs Implementation**
**Câu hỏi:** 
- Trong test `testLoginSuccess()`, em verify kết quả bằng cách check `response.isSuccess()` và `response.getToken()` - đây là behavioral testing hay implementation testing?
- Nếu em refactor `AuthService` để thay đổi cách generate token (vẫn giữ nguyên output), test có break không?
- Em có test nào kiểm tra side effects (như log, metrics) không?

**Trả lời:**

**Behavioral vs Implementation Testing:**
Test của em là **behavioral testing** (outcome-based) ạ thầy:

```java
@Test
void testLoginSuccess() {
    LoginRequest loginRequest = new LoginRequest("hyan123", "password123");
    LoginResponse response = authService.authenticate(loginRequest);
    
    // Verify BEHAVIOR (output/outcome)
    assertTrue(response.isSuccess());           // ✅ Behavioral
    assertNotNull(response.getToken());         // ✅ Behavioral
    assertEquals("Đăng nhập thành công", response.getMessage());  // ✅ Behavioral
}
```

Em verify **KẾT QUẢ** (response có đúng không), không verify **CÁCH LÀM** (method nào được gọi):
- ✅ Response có success = true không?
- ✅ Token có được tạo không?
- ✅ Message có đúng không?

**Implementation testing** sẽ là:
```java
// ❌ Bad - test implementation details
verify(userRepository).findByUsername("hyan123");  // Care về HOW
verify(passwordEncoder).matches(any(), any());     // Care về internal calls
verify(jwtTokenProvider).generateToken("hyan123"); // Care về order of calls
```

**Ưu điểm của behavioral testing:**
- Test không bị break khi refactor internal logic
- Focus vào business requirements
- Dễ đọc, dễ hiểu (test document behavior)

**Nếu refactor cách generate token:**
Test **KHÔNG BREAK** ạ thầy, đây là sức mạnh của behavioral testing:

*Scenario 1: Đổi cách generate token*
```java
// OLD
public String generateToken(String username) {
    return Jwts.builder()
        .setSubject(username)
        .signWith(key, HS256)
        .compact();
}

// NEW - thêm claims
public String generateToken(String username) {
    return Jwts.builder()
        .setSubject(username)
        .claim("role", "USER")      // ← Thêm claim mới
        .claim("timestamp", now())   // ← Thêm timestamp
        .signWith(key, HS512)       // ← Đổi algorithm
        .compact();
}
```

Test vẫn pass vì:
- Em chỉ assert `assertNotNull(response.getToken())` 
- Không care token structure bên trong
- Chỉ quan tâm "có token hay không"

*Scenario 2: Đổi vị trí gọi method*
```java
// OLD
public LoginResponse authenticate(LoginRequest req) {
    UserEntity user = repo.findByUsername(req.getUsername())...;
    if (!encoder.matches(...)) throw ...;
    String token = jwtProvider.generateToken(user.getUsername());
    return new LoginResponse(..., token, ...);
}

// NEW - generate token trước
public LoginResponse authenticate(LoginRequest req) {
    UserEntity user = repo.findByUsername(req.getUsername())...;
    String token = jwtProvider.generateToken(user.getUsername());  // ← Di chuyển lên
    if (!encoder.matches(...)) throw ...;
    return new LoginResponse(..., token, ...);
}
```

Test vẫn pass vì không verify thứ tự gọi method.

**Khi nào test BREAK:**
Test chỉ break khi **BEHAVIOR thay đổi**:
```java
// Đổi response structure
return new LoginResponse(true, "Success");  // ❌ Không có token field
// → Test fail vì getToken() return null
```

Đây là điều em muốn - test phải fail khi behavior thay đổi.

**Test side effects:**
Em **CHƯA** có test cho side effects ạ thầy. Trong code hiện tại không có logging hay metrics, nhưng nếu có:

```java
public LoginResponse authenticate(LoginRequest req) {
    logger.info("Login attempt for user: {}", req.getUsername());  // Side effect
    // ... logic ...
    metricsService.recordLogin(user.getId());  // Side effect
    return response;
}
```

Em nên test side effects bằng mock:
```java
@Mock
private Logger logger;

@Mock
private MetricsService metricsService;

@Test
void testLoginRecordsMetrics() {
    authService.authenticate(loginRequest);
    
    // Verify side effects
    verify(logger).info(contains("Login attempt"));
    verify(metricsService).recordLogin(anyLong());
}
```

Đây là trường hợp dùng **interaction-based testing** hợp lý vì:
- Side effects không ảnh hưởng return value
- Không thể verify bằng cách check output
- Phải verify "có gọi method không"

Nhưng trong unit test của em, vì không có side effects nên chỉ cần behavioral testing thôi.

### **11. Coverage Metrics**
**Câu hỏi:**
- Em đã đạt coverage bao nhiêu % cho AuthService? Line coverage vs Branch coverage khác gì nhau?
- Trong `JwtTokenProvider.validateToken()`, em có test case nào cho catch block (JwtException) không?
- 100% coverage có đảm bảo code không có bug không? Ví dụ minh họa?

**Trả lời:**

**Coverage đạt được:**
Dạ, theo JaCoCo report trong `target/site/jacoco/`, em đã đạt:
- **AuthService**: ~85-90% line coverage
- **ProductService**: ~90% line coverage
- **Overall backend**: ~80% coverage

Em chưa đạt 100% vì một số edge cases chưa test, ví dụ:
- Exception handling trong một số method
- Một số validation branches chưa cover hết

**Line Coverage vs Branch Coverage:**

*Line Coverage:*
- Đo % số dòng code được execute trong test
- Ví dụ:
```java
public void method() {
    int x = 1;        // Line 1
    int y = 2;        // Line 2
    return x + y;     // Line 3
}
```
Nếu test gọi method() → Line coverage = 100% (3/3 lines)

*Branch Coverage:*
- Đo % số nhánh (if/else, switch, loops) được execute
- Ví dụ:
```java
public String check(int x) {
    if (x > 0) {           // Branch point
        return "positive"; // Branch 1
    } else {
        return "negative"; // Branch 2  
    }
}
```

Test chỉ với `check(5)`:
- Line coverage: 100% (tất cả lines được chạy)
- Branch coverage: 50% (chỉ test branch x > 0, chưa test branch x <= 0)

Cần thêm test `check(-1)` để đạt 100% branch coverage.

**Branch coverage quan trọng hơn** vì:
- Line coverage có thể misleading
- Branch coverage đảm bảo test tất cả logic paths

**Test case cho JwtException catch block:**
Em **CHƯA CÓ** test case riêng cho catch block ạ thầy. Đây là gap:

```java
// JwtTokenProvider.java
public boolean validateToken(String token) {
    try {
        Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token);
        return true;
    } catch (JwtException | IllegalArgumentException e) {  // ← Chưa test
        return false;
    }
}
```

Em nên thêm tests:
```java
@Test
void testValidateToken_InvalidSignature() {
    String invalidToken = "eyJhbGciOiJIUzI1NiJ9.fake.signature";
    assertFalse(jwtTokenProvider.validateToken(invalidToken));
}

@Test
void testValidateToken_ExpiredToken() {
    // Mock time để token hết hạn
    String expiredToken = createExpiredToken();
    assertFalse(jwtTokenProvider.validateToken(expiredToken));
}

@Test
void testValidateToken_MalformedToken() {
    assertFalse(jwtTokenProvider.validateToken("not-a-jwt-token"));
}

@Test
void testValidateToken_NullToken() {
    assertFalse(jwtTokenProvider.validateToken(null));
}
```

Các tests này sẽ trigger catch block và tăng branch coverage.

**100% coverage có đảm bảo không bug?**
**KHÔNG** ạ thầy! Coverage chỉ đo "code được chạy", không đảm bảo "code đúng".

*Ví dụ minh họa:*
```java
// Bug logic: nên là >= nhưng viết >
public boolean isAdult(int age) {
    if (age > 18) {      // ❌ Bug: thiếu =
        return true;
    }
    return false;
}

// Test đạt 100% coverage nhưng không phát hiện bug
@Test
void testIsAdult() {
    assertTrue(isAdult(20));   // Pass (20 > 18)
    assertFalse(isAdult(10));  // Pass (10 !> 18)
}
// Line coverage: 100%
// Branch coverage: 100%
// Nhưng thiếu boundary test với age = 18!
```

Bug chỉ phát hiện khi test boundary:
```java
@Test
void testIsAdult_Boundary() {
    assertTrue(isAdult(18));   // ❌ FAIL - phát hiện bug!
}
```

*Ví dụ khác - logic sai:*
```java
// Bug: return sai giá trị
public int add(int a, int b) {
    return a - b;  // ❌ Sai logic
}

@Test
void testAdd() {
    int result = add(2, 3);
    assertNotNull(result);  // ✅ Pass
    // Coverage 100% nhưng không verify correctness!
}
```

**Bài học:**
- Coverage là necessary but not sufficient
- Cần kết hợp:
  - High coverage (>80%)
  - Good assertions (verify correctness, not just execution)
  - Boundary testing
  - Edge cases testing
  - Integration testing

Em đang cố gắng balance giữa coverage và quality of tests ạ!

---

### **B. Integration Testing (5 câu)**

### **12. @SpringBootTest vs @WebMvcTest**
**Câu hỏi:** So sánh 2 cách test em đã dùng:
- `AuthControllerTest` (integration) dùng `@SpringBootTest` - nó load những gì?
- `AuthControllerTest` (mock) dùng `@WebMvcTest` - khác gì với SpringBootTest?
- Tại sao integration test chậm hơn mock test? Cụ thể chậm bao nhiêu lần trong project của em?
- Khi nào nên dùng integration test, khi nào dùng unit test với mock?

**Trả lời:**

**@SpringBootTest load những gì:**
`@SpringBootTest` load **TOÀN BỘ** Spring Application Context ạ thầy:

```java
@SpringBootTest(classes = BackendApplication.class)
@AutoConfigureMockMvc
public class AuthControllerTest {
    // Full application context
}
```

Nó load:
1. **All @Component, @Service, @Repository, @Controller** - tất cả beans
2. **Database connections** - H2 in-memory hoặc real database
3. **Security configuration** - SecurityFilterChain, JwtFilter, etc.
4. **Properties files** - application.properties
5. **Auto-configurations** - JPA, Web MVC, Security, etc.
6. **Transaction management** - PlatformTransactionManager
7. **Dependencies** - Tất cả dependencies được inject

Về cơ bản, nó **start toàn bộ application** như production, chỉ khác là dùng test profile.

**@WebMvcTest load những gì:**
`@WebMvcTest` chỉ load **Web Layer** (controllers only):

```java
@WebMvcTest(LoginController.class)
public class AuthControllerTest {
    @MockBean
    private AuthService authService;  // Service bị mock
}
```

Nó load:
1. **Chỉ Controller được chỉ định** - LoginController
2. **Web MVC infrastructure** - DispatcherServlet, MockMvc
3. **JSON converters** - ObjectMapper
4. **Validation** - Validator
5. **Exception handlers** - @ControllerAdvice

Nó **KHÔNG** load:
- ❌ Service layer
- ❌ Repository layer  
- ❌ Database
- ❌ Security full configuration
- ❌ Other controllers

**So sánh performance:**

Trong project của em:
- **@SpringBootTest**: ~2-3 giây để start application context
- **@WebMvcTest**: ~0.5-1 giây để start

Khi chạy full test suite:
- Integration tests (SpringBootTest): ~5-10 giây cho 10 tests
- Mock tests (WebMvcTest): ~1-2 giây cho 10 tests

**Tại sao chậm hơn:**
1. **Context initialization**:
   - SpringBootTest: load 50-100 beans
   - WebMvcTest: load ~10 beans
2. **Database setup**:
   - SpringBootTest: khởi tạo connection pool, schema
   - WebMvcTest: không có database
3. **Dependencies**:
   - SpringBootTest: inject tất cả dependencies (cascade loading)
   - WebMvcTest: chỉ inject web dependencies
4. **Transactions**:
   - SpringBootTest: wrap mỗi test trong transaction, rollback sau test
   - WebMvcTest: không có transaction overhead

**Khi nào dùng cái nào:**

*Dùng @SpringBootTest (Integration) khi:*
- ✅ Test **end-to-end flow**: Request → Controller → Service → Repository → Database
- ✅ Test **Spring configuration**: beans wiring, properties injection
- ✅ Test **security integration**: filters, authentication, authorization
- ✅ Test **database operations**: JPA queries, transactions
- ✅ Test **interactions giữa nhiều components**

Ví dụ: Test login flow với real password encoding, database lookup, JWT generation

*Dùng @WebMvcTest (Mock) khi:*
- ✅ Test **controller logic only**: routing, request/response mapping
- ✅ Test **validation**: @Valid constraints
- ✅ Test **exception handling**: @ControllerAdvice
- ✅ Test **HTTP layer**: status codes, headers, content type
- ✅ **Fast feedback** - chạy nhiều lần trong development

Ví dụ: Test controller trả đúng status code 400 khi validation fail

**Strategy của em:**
```
Pyramid approach:
- 60% Unit tests (Fake/Mock) - nhanh, test business logic
- 30% Integration tests (SpringBootTest) - test wiring & interactions  
- 10% E2E tests (Cypress) - test user flows
```

Trong môn này em focus nhiều vào Integration test để học cách test toàn bộ stack, nhưng production nên có nhiều unit test hơn vì chạy nhanh.

### **13. Transaction Rollback trong Test**
**Câu hỏi:** Trong `AuthControllerTest` (integration), em dùng `@Transactional`:
- Test data được rollback tự động sau mỗi test như thế nào?
- Tại sao em vẫn cần `@AfterEach cleanTest()` nếu đã có `@Transactional`?
- Nếu em bỏ `@Transactional`, data test có leak vào database thật không?

**Trả lời:**

**Cơ chế rollback tự động:**
Khi em đánh `@Transactional` trên test class, Spring Test Framework tự động:

```java
@SpringBootTest
@AutoConfigureMockMvc
@Transactional  // ← Magic happens here
public class AuthControllerTest {
    // ...
}
```

Luồng hoạt động:
1. **Trước mỗi test method**: Spring tạo một transaction mới
2. **Trong test**: Tất cả database operations (INSERT, UPDATE, DELETE) xảy ra trong transaction này
3. **Sau test xong**: Spring tự động **ROLLBACK** transaction thay vì COMMIT
4. Database trở về trạng thái ban đầu

Ví dụ cụ thể:
```java
@Test
void testLoginSuccess() {
    // Transaction bắt đầu
    
    // INSERT user vào database
    testUser = userService.create(testUser);  
    
    // Test login
    mockMvc.perform(post("/auth/login")...)
           .andExpect(status().isOk());
    
    // Transaction ROLLBACK tự động
    // → testUser bị xóa khỏi database
}

@Test  
void testAnotherTest() {
    // Database sạch sẽ, không có testUser từ test trước
}
```

**Tại sao vẫn cần @AfterEach cleanTest():**
Đây là câu hỏi hay ạ thầy! Thực ra trong code của em:

```java
@AfterEach
void cleanTest() {
    if (testUser != null)
        userRepository.delete(testUser);
}
```

**Đoạn này THỪA** nếu đã có `@Transactional` ạ! Lý do:
- `@Transactional` đã rollback tự động rồi
- `cleanTest()` là leftovers từ khi em chưa dùng `@Transactional`
- Khi test chạy:
  1. testUser được insert (trong transaction)
  2. Test chạy xong, transaction rollback → testUser mất
  3. `cleanTest()` chạy, nhưng testUser không tồn tại nữa → delete không có effect

**Em nên refactor:**
```java
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AuthControllerTest {
    @BeforeEach
    void setUp() {
        testUser = new UserEntity();
        testUser.setUsername("Hyan2005");
        testUser.setPassword("sugoi123");
        testUser.setMail("hyan123@gmail.com");
        testUser = userService.create(testUser);
    }
    
    // ❌ Không cần @AfterEach nữa!
    // @Transactional đã handle cleanup
}
```

**Khi nào CẦN @AfterEach:**
- Khi **KHÔNG** dùng `@Transactional` (ví dụ test async operations)
- Khi test tạo external resources (files, network connections)
- Khi test tương tác với services bên ngoài Spring context

**Nếu bỏ @Transactional:**
**CÓ**, data sẽ leak vào database ạ thầy! Cụ thể:

```java
@SpringBootTest
@AutoConfigureMockMvc
// ❌ Không có @Transactional
public class AuthControllerTest {
    @Test
    void test1() {
        userService.create(user1);  // COMMIT vào database
    }
    
    @Test
    void test2() {
        userService.create(user2);  // COMMIT vào database
    }
    
    @Test
    void test3() {
        List<User> all = userRepository.findAll();
        // Có cả user1, user2 từ tests trước!
        assertEquals(0, all.size());  // ❌ FAIL! actual = 2
    }
}
```

Hậu quả:
1. **Test pollution**: Tests ảnh hưởng lẫn nhau
2. **Flaky tests**: Test pass/fail tùy thuộc vào thứ tự chạy
3. **Database bloat**: Mỗi lần chạy test suite, database càng lúc càng nhiều junk data
4. **Cleanup hell**: Phải manually cleanup trong @AfterEach, dễ quên

**Trong project em:**
- Em dùng **H2 in-memory database** cho tests
- Database được tạo mới mỗi lần start test suite
- Nhưng vẫn cần `@Transactional` để isolate giữa các test methods

**Best practice:**
```java
// ✅ Good
@SpringBootTest
@Transactional  // Auto rollback
public class IntegrationTest {
    // Clean, isolated tests
}

// ❌ Bad  
@SpringBootTest
public class IntegrationTest {
    @AfterEach
    void cleanup() {
        // Manual cleanup - error-prone
        userRepo.deleteAll();
        productRepo.deleteAll();
        // Dễ quên một table → data leak
    }
}
```

Em sẽ remove `@AfterEach cleanTest()` trong refactor lần sau để code gọn hơn ạ!

### **14. MockMvc Request Matching**
**Câu hỏi:** Phân tích cách em test API response:
- Trong dòng 72-77 của `AuthControllerTest` (integration), em dùng `jsonPath()` - nó parse JSON như thế nào?
- Nếu response JSON có nested object sâu 3-4 level, làm sao test hiệu quả?
- Tại sao không deserialize thẳng sang LoginResponse rồi assert object?

**Trả lời:**

**Cơ chế jsonPath():**
`jsonPath()` sử dụng **JsonPath expression** (giống XPath cho XML) để navigate JSON structure ạ thầy:

```java
mockMvc.perform(post("/auth/login")...)
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.success").value(true))
    .andExpect(jsonPath("$.message").value("Đăng nhập thành công"))
    .andExpect(jsonPath("$.token").isNotEmpty())
    .andExpect(jsonPath("$.userResponse.username").value("Hyan2005"))
    .andExpect(jsonPath("$.userResponse.mail").value("hyan123@gmail.com"));
```

**Parse như thế nào:**
1. MockMvc nhận response body (JSON string)
2. Spring MVC dùng **Jayway JsonPath library** để parse
3. JsonPath tạo document tree từ JSON
4. Expression `"$.success"` được evaluate:
   - `$` = root object
   - `.success` = field "success" trong root
5. So sánh value với expected value

**Syntax:**
- `$` - root
- `.fieldName` - access field
- `[0]` - array index
- `..` - recursive descent
- `*` - wildcard

**Test nested object sâu 3-4 level:**
Nếu có response phức tạp:
```json
{
  "data": {
    "user": {
      "profile": {
        "address": {
          "city": "Ho Chi Minh",
          "district": "District 1"
        }
      }
    }
  }
}
```

Em có thể test bằng:
```java
// Cách 1: Nested path
.andExpect(jsonPath("$.data.user.profile.address.city").value("Ho Chi Minh"))
.andExpect(jsonPath("$.data.user.profile.address.district").value("District 1"))

// Cách 2: Verify structure exists
.andExpect(jsonPath("$.data.user.profile.address").exists())
.andExpect(jsonPath("$.data.user.profile.address.city").isString())

// Cách 3: Verify array
.andExpect(jsonPath("$.products[0].name").value("Product 1"))
.andExpect(jsonPath("$.products[1].price").value(100000))
.andExpect(jsonPath("$.products.length()").value(2))

// Cách 4: Complex expressions
.andExpect(jsonPath("$.products[?(@.price > 50000)].length()").value(1))
```

**Ưu điểm jsonPath():**
- ✅ Không cần deserialize object
- ✅ Test chỉ những fields quan trọng
- ✅ Flexible - có thể test partial JSON
- ✅ Readable - expressions rõ ràng

**Nhược điểm:**
- ❌ Expressions phức tạp khó đọc
- ❌ Không có type safety
- ❌ Lỗi typo trong path không được phát hiện lúc compile time

**Tại sao không deserialize sang LoginResponse:**
Câu hỏi hay ạ thầy! Em **CÓ THỂ** deserialize, ví dụ:

```java
// Cách deserialize
@Test
void testLoginSuccess() throws Exception {
    MvcResult result = mockMvc.perform(post("/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isOk())
            .andReturn();
    
    String jsonResponse = result.getResponse().getContentAsString();
    LoginResponse response = objectMapper.readValue(jsonResponse, LoginResponse.class);
    
    // Assert với object
    assertTrue(response.isSuccess());
    assertEquals("Đăng nhập thành công", response.getMessage());
    assertNotNull(response.getToken());
    assertEquals("Hyan2005", response.getUserResponse().getUsername());
}
```

**So sánh 2 cách:**

*JsonPath (cách em dùng):*
- ✅ Concise - 1 line cho 1 assertion
- ✅ Fluent API - chain nhiều assertions
- ✅ Partial testing - chỉ test những gì cần
- ✅ Không phụ thuộc vào class structure
- ❌ Không có autocomplete
- ❌ String-based - error-prone

*Deserialize (alternative):*
- ✅ Type-safe - compile-time checking
- ✅ IDE support - autocomplete
- ✅ Reuse domain objects
- ✅ Better for complex assertions
- ❌ Verbose - nhiều code hơn
- ❌ Phụ thuộc vào class structure
- ❌ Phải deserialize toàn bộ object

**Khi nào dùng cái nào:**

*Dùng jsonPath() khi:*
- Response đơn giản, ít fields
- Chỉ cần verify vài fields quan trọng
- Test negative cases (missing fields)
- Quick assertions

*Dùng deserialize khi:*
- Response phức tạp, nhiều nested objects
- Cần assert nhiều fields
- Cần logic phức tạp (ví dụ: sum, average)
- Muốn type safety

**Trong project em:**
Em dùng jsonPath() vì:
- Response structures đơn giản (2-3 levels)
- Chỉ cần verify key fields
- Code gọn hơn, dễ đọc
- Follow Spring MVC testing best practices

Nhưng nếu có API trả về complex DTO với 10+ fields, em sẽ dùng deserialize để assertions rõ ràng hơn.

### **15. Test Data Management**
**Câu hỏi:**
- Em tạo `testUser` trong `setUp()` bằng cách gọi `userService.create()` - có vấn đề gì nếu username bị duplicate khi chạy nhiều lần?
- Nếu database có unique constraint violation, test sẽ fail như thế nào?
- Em có chiến lược nào để tạo unique test data (như random username)?

**Trả lời:**

**Vấn đề duplicate username:**
Trong setup hiện tại của em:

```java
@BeforeEach
void setUp() {
    testUser = new UserEntity();
    testUser.setUsername("Hyan2005");  // ← Fixed username
    testUser.setPassword("sugoi123");
    testUser.setMail("hyan123@gmail.com");
    testUser = userService.create(testUser);
}
```

**KHÔNG** có vấn đề duplicate ạ thầy, vì:

1. **@Transactional rollback**: Sau mỗi test, user bị xóa tự động
2. **Isolated tests**: Mỗi test bắt đầu với database sạch
3. **setUp() chạy mỗi test**: User được tạo mới mỗi lần

Luồng:
```
Test1: setUp() → create user "Hyan2005" → test chạy → rollback → user mất
Test2: setUp() → create user "Hyan2005" lại → test chạy → rollback → user mất
Test3: setUp() → create user "Hyan2005" lại → ...
```

Không có conflict vì user cũ đã bị rollback rồi.

**Khi nào CÓ vấn đề:**
Nếu em **KHÔNG dùng @Transactional**:
```java
@SpringBootTest
// ❌ Không có @Transactional
public class AuthControllerTest {
    @BeforeEach
    void setUp() {
        testUser.setUsername("Hyan2005");
        userService.create(testUser);  // COMMIT vào DB
    }
    
    @Test
    void test1() { /* ... */ }
    
    @Test  
    void test2() {
        // setUp() chạy lại → tạo user "Hyan2005" lần 2
        // ❌ ERROR: Duplicate entry 'Hyan2005' for key 'username'
    }
}
```

**Unique constraint violation xảy ra như thế nào:**
Nếu database có:
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,  -- ← Unique constraint
    email VARCHAR(100) UNIQUE NOT NULL
);
```

Khi insert duplicate:
```java
userService.create(new UserEntity("Hyan2005", ...));  // OK
userService.create(new UserEntity("Hyan2005", ...));  // ❌ Exception!
```

**Exception được throw:**
```
org.springframework.dao.DataIntegrityViolationException: 
could not execute statement; 
SQL [n/a]; constraint [uk_username]; 
nested exception is org.hibernate.exception.ConstraintViolationException
```

**Test sẽ fail:**
```java
@Test
void testDuplicateUser() {
    userService.create(new UserEntity("user1", ...));
    
    // ❌ Test FAIL với exception
    userService.create(new UserEntity("user1", ...));
    
    // Nếu không catch, test báo ERROR, không phải PASS/FAIL
}
```

**Chiến lược tạo unique test data:**

Em **CHƯA** implement strategy này, nhưng có thể làm:

*Cách 1: UUID/Random suffix*
```java
@BeforeEach
void setUp() {
    String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
    testUser.setUsername("testuser_" + uniqueSuffix);
    testUser.setMail("test_" + uniqueSuffix + "@example.com");
    testUser = userService.create(testUser);
}
// Mỗi test có username khác nhau: testuser_a3f8b9c2, testuser_d4e7f1a6, ...
```

*Cách 2: Timestamp*
```java
@BeforeEach
void setUp() {
    long timestamp = System.currentTimeMillis();
    testUser.setUsername("testuser_" + timestamp);
    testUser = userService.create(testUser);
}
```

*Cách 3: Atomic counter*
```java
public class AuthControllerTest {
    private static final AtomicInteger counter = new AtomicInteger(0);
    
    @BeforeEach
    void setUp() {
        int id = counter.incrementAndGet();
        testUser.setUsername("testuser_" + id);
        testUser = userService.create(testUser);
    }
}
```

*Cách 4: Test Data Builder*
```java
public class UserTestDataBuilder {
    private static int sequence = 0;
    
    public static UserEntity createUniqueUser() {
        return UserEntity.builder()
            .username("user_" + (++sequence))
            .password("password123")
            .mail("user" + sequence + "@test.com")
            .build();
    }
}

// Trong test:
@BeforeEach
void setUp() {
    testUser = UserTestDataBuilder.createUniqueUser();
    testUser = userService.create(testUser);
}
```

**Trade-offs:**

*Fixed username (cách em đang dùng):*
- ✅ Predictable - dễ debug
- ✅ Simple - không cần logic phức tạp
- ✅ Work với @Transactional
- ❌ Không work nếu không có rollback
- ❌ Không work với parallel tests

*Random username:*
- ✅ Always unique - không conflict
- ✅ Work without @Transactional
- ✅ Work với parallel execution
- ❌ Hard to debug - không biết username là gì
- ❌ Database pollution nếu không cleanup

**Best practice cho project em:**
Vì em dùng `@Transactional` + sequential tests:
```java
// ✅ Current approach is fine
@BeforeEach
void setUp() {
    testUser = new UserEntity();
    testUser.setUsername("Hyan2005");  // Fixed OK
    // @Transactional ensures cleanup
}
```

Nhưng nếu scale lên (parallel tests, no @Transactional), em nên:
```java
// ✅ Better for scalability
@BeforeEach
void setUp() {
    testUser = UserTestDataBuilder.createUniqueUser();
    testUser = userService.create(testUser);
}
```

Em nghĩ trong môn học này cách hiện tại ok, nhưng trong production em sẽ dùng unique data để safe hơn ạ!

### **16. Error Response Structure Validation**
**Câu hỏi:**
- Khi test fail case (ví dụ wrong password), em verify cả status code và message - tại sao không dùng `MockMvc.andDo(print())` để debug?
- Nếu `ErrorResponse` structure thay đổi (thêm field `timestamp`), bao nhiêu test cần update?
- Em có test nào verify error response JSON schema không?

**Trả lời:**

**Tại sao không dùng andDo(print()):**
Em **CÓ DÙNG** `andDo(print())` khi debug ạ thầy! Nhưng không commit vào code vì:

```java
// Khi debug:
@Test
void testLoginFailWrongPassword() throws Exception {
    mockMvc.perform(post("/auth/login")...)
        .andDo(print())  // ← Print ra console
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.message").value("Mật khẩu không chính xác"));
}
```

Output khi chạy:
```
MockHttpServletRequest:
      HTTP Method = POST
      Request URI = /auth/login
       Parameters = {}
          Headers = [Content-Type:"application/json"]
             Body = {"username":"Hyan2005","password":"wrongpass"}

MockHttpServletResponse:
           Status = 401
    Error message = null
          Headers = [Content-Type:"application/json"]
     Content type = application/json
             Body = {"success":false,"message":"Mật khẩu không chính xác","token":null}
```

**Khi nào dùng print():**
- ✅ Debug test failing - xem exact response
- ✅ Develop test mới - verify format
- ✅ Investigate flaky tests
- ✅ Document API behavior (temporary)

**Khi nào KHÔNG dùng:**
- ❌ Production test code - noise trong logs
- ❌ CI/CD pipeline - làm chậm, cluttered output
- ❌ Tests đã stable

**Alternative cho print():**

*Cách 1: Conditional logging*
```java
private boolean DEBUG = false;  // Set true khi cần debug

@Test
void test() throws Exception {
    ResultActions result = mockMvc.perform(...)
        .andExpect(...);
    
    if (DEBUG) {
        result.andDo(print());
    }
}
```

*Cách 2: Custom result handler*
```java
@Test
void test() throws Exception {
    mockMvc.perform(...)
        .andDo(result -> {
            System.out.println("Status: " + result.getResponse().getStatus());
            System.out.println("Body: " + result.getResponse().getContentAsString());
        })
        .andExpect(...);
}
```

*Cách 3: Logger instead of print*
```java
private static final Logger log = LoggerFactory.getLogger(AuthControllerTest.class);

@Test
void test() throws Exception {
    MvcResult result = mockMvc.perform(...).andReturn();
    log.debug("Response: {}", result.getResponse().getContentAsString());
}
// Chỉ log khi run với log level DEBUG
```

**Nếu ErrorResponse thay đổi structure:**

Hiện tại ErrorResponse:
```java
public class ErrorResponse {
    private int statusCode;
    private String message;
}
```

Nếu thêm field:
```java
public class ErrorResponse {
    private int statusCode;
    private String message;
    private LocalDateTime timestamp;  // ← NEW
    private String path;               // ← NEW
}
```

**Số test cần update:**
Em cần update **0 tests** ạ thầy! Đây là ưu điểm của jsonPath:

```java
// Tests hiện tại
.andExpect(jsonPath("$.statusCode").value(404))
.andExpect(jsonPath("$.message").value("..."))

// Vẫn PASS sau khi thêm fields mới
// Vì chỉ verify những fields em quan tâm
```

JsonPath không care response có thêm fields nào khác, chỉ verify những gì em specify.

**Nếu dùng deserialize thì khác:**
```java
// Old test
ErrorResponse error = objectMapper.readValue(json, ErrorResponse.class);
assertEquals(404, error.getStatusCode());
assertEquals("...", error.getMessage());
// ✅ Vẫn work vì fields mới có default values

// Nhưng nếu thêm required field:
public ErrorResponse {
    @JsonProperty(required = true)
    private LocalDateTime timestamp;  // ← Required
}
// ❌ Deserialize FAIL vì missing required field
```

**Test JSON schema:**
Em **CHƯA** có test verify schema ạ thầy. Đây là gap trong testing strategy:

```java
// Em nên thêm:
@Test
void testErrorResponseSchema() throws Exception {
    mockMvc.perform(post("/auth/login")
            .content("{\"username\":\"\",\"password\":\"\"}"))
        .andExpect(status().isBadRequest())
        // Verify schema structure
        .andExpect(jsonPath("$.statusCode").isNumber())
        .andExpect(jsonPath("$.message").isString())
        .andExpect(jsonPath("$.statusCode").exists())
        .andExpect(jsonPath("$.message").exists())
        // Verify no extra fields (optional)
        .andExpect(jsonPath("$.*", hasSize(2)));
}
```

**Better approach - JSON Schema validation:**
```java
// Dùng json-schema-validator
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;

@Test
void testErrorResponseMatchesSchema() throws Exception {
    String schema = """
    {
        "type": "object",
        "properties": {
            "statusCode": {"type": "integer"},
            "message": {"type": "string"}
        },
        "required": ["statusCode", "message"],
        "additionalProperties": false
    }
    """;
    
    mockMvc.perform(post("/auth/login")...)
        .andExpect(content().string(matchesJsonSchema(schema)));
}
```

**Trade-offs:**

*Không verify schema (current):*
- ✅ Simple tests
- ✅ Fast to write
- ❌ Không catch structure changes
- ❌ Không document expected format

*Verify schema:*
- ✅ Catch breaking changes
- ✅ Self-documenting
- ✅ Enforce contracts
- ❌ More code
- ❌ Maintain schema definitions

**Trong project em:**
- Em chỉ verify key fields (statusCode, message)
- Assume structure stable
- Focus on business logic testing

**Best practice:**
Nên có ít nhất 1 test verify schema cho mỗi response type:
```java
@Test
@Tag("schema")
void testLoginSuccessResponseSchema() {
    // Verify LoginResponse structure
}

@Test
@Tag("schema")  
void testErrorResponseSchema() {
    // Verify ErrorResponse structure
}
```

Chạy schema tests trong CI/CD để catch breaking changes sớm!

---

### **C. Mock Testing (5 câu)**

### **17. Mockito - When().thenReturn() vs doReturn().when()**
**Câu hỏi:** Trong `AuthControllerTest` (mock), dòng 60:
```java
when(authService.authenticate(any(LoginRequest.class))).thenReturn(mockLoginResponse);
```
- `any(LoginRequest.class)` match những gì? Nếu em pass null vào, mock có work không?
- Tại sao em dùng `when().thenReturn()` chứ không dùng `doReturn().when()`?
- Nếu em stub 2 lần cùng một method với different arguments, behavior ra sao?

**Trả lời:**

**ArgumentMatcher any() hoạt động:**
`any(LoginRequest.class)` là **argument matcher** của Mockito ạ thầy:

```java
when(authService.authenticate(any(LoginRequest.class)))
    .thenReturn(mockLoginResponse);
```

Nó match:
- ✅ Bất kỳ instance nào của LoginRequest
- ✅ Subclass của LoginRequest (nếu có)
- ✅ **NULL** - đây là điểm quan trọng!

**Ví dụ cụ thể:**
```java
// Setup stub
when(authService.authenticate(any(LoginRequest.class)))
    .thenReturn(successResponse);

// Tất cả đều match:
authService.authenticate(new LoginRequest("user1", "pass1"));  // ✅ Match
authService.authenticate(new LoginRequest("user2", "pass2"));  // ✅ Match  
authService.authenticate(null);                                 // ✅ Match!
```

**Null case:**
Có, mock **VẪN WORK** với null:
```java
@Test
void testAuthenticateWithNull() {
    when(authService.authenticate(any(LoginRequest.class)))
        .thenReturn(mockResponse);
    
    // ✅ Return mockResponse, không throw NullPointerException
    LoginResponse response = authService.authenticate(null);
    assertEquals(mockResponse, response);
}
```

Đây có thể là **vấn đề** nếu production code expect null check:
```java
// Production code
public LoginResponse authenticate(LoginRequest req) {
    if (req == null) throw new IllegalArgumentException();  // Should throw
    // ...
}

// Mock test - không test được null handling!
when(authService.authenticate(any())).thenReturn(success);
authService.authenticate(null);  // Không throw exception như production
```

**Giải pháp - strict matching:**
```java
// Nếu muốn reject null:
when(authService.authenticate(argThat(req -> req != null)))
    .thenReturn(mockResponse);

// Hoặc dùng specific value:
when(authService.authenticate(eq(validRequest)))
    .thenReturn(mockResponse);
```

**when().thenReturn() vs doReturn().when():**

Em dùng `when().thenReturn()` vì:

```java
// Style 1: when().thenReturn() - em đang dùng
when(authService.authenticate(any())).thenReturn(mockResponse);

// Style 2: doReturn().when() - alternative
doReturn(mockResponse).when(authService).authenticate(any());
```

**Khác biệt:**

*when().thenReturn():*
- **Type-safe**: Compiler check return type
```java
// ✅ Compile error nếu type mismatch
when(authService.authenticate(any()))
    .thenReturn("string");  // ❌ Error: expect LoginResponse
```

- **Method được gọi thật** khi stub:
```java
when(realService.doSomething()).thenReturn(result);
// ← doSomething() được GỌI 1 lần khi setup stub
```

- **Không work với void methods**:
```java
when(service.voidMethod()).thenReturn();  // ❌ Compile error
```

*doReturn().when():*
- **Not type-safe**: Accept any Object
```java
// ⚠️ Compile OK nhưng runtime error
doReturn("string").when(authService).authenticate(any());
```

- **Method KHÔNG được gọi** khi stub:
```java
doReturn(result).when(realService).doSomething();
// ← doSomething() KHÔNG được gọi
```

- **Work với void methods**:
```java
doNothing().when(service).voidMethod();  // ✅ OK
```

- **Work với spy objects**:
```java
Service spy = spy(new RealService());
doReturn(result).when(spy).method();  // ✅ OK
when(spy.method()).thenReturn(result);  // ❌ Gọi real method!
```

**Khi nào dùng cái nào:**

*when().thenReturn() - em dùng vì:*
- ✅ Đọc tự nhiên hơn: "when X then return Y"
- ✅ Type-safe
- ✅ Standard style cho mock
- ❌ Không work với void
- ❌ Không work với spy

*doReturn().when() - dùng khi:*
- ✅ Mock void methods
- ✅ Mock spy objects
- ✅ Tránh gọi real method
- ❌ Không type-safe
- ❌ Syntax ngược, khó đọc

**Stub 2 lần cùng method:**

```java
// Stub lần 1
when(authService.authenticate(any(LoginRequest.class)))
    .thenReturn(successResponse);

// Stub lần 2 - OVERRIDE stub lần 1
when(authService.authenticate(any(LoginRequest.class)))
    .thenReturn(failureResponse);

// Kết quả: Chỉ stub lần 2 có effect
LoginResponse res = authService.authenticate(request);
assertEquals(failureResponse, res);  // ✅ Return failure, not success
```

**Behavior:**
- Stub sau **OVERRIDE** stub trước
- Mockito chỉ nhớ stub cuối cùng

**Nếu muốn different behavior với different arguments:**
```java
// Stub với argument cụ thể
when(authService.authenticate(argThat(req -> 
    req.getUsername().equals("admin"))))
    .thenReturn(adminResponse);

when(authService.authenticate(argThat(req -> 
    req.getUsername().equals("user"))))
    .thenReturn(userResponse);

// Calls
authService.authenticate(new LoginRequest("admin", "..."));  // → adminResponse
authService.authenticate(new LoginRequest("user", "..."));   // → userResponse
```

**Sequential returns:**
```java
// Return khác nhau mỗi lần gọi
when(authService.authenticate(any()))
    .thenReturn(response1)   // Lần 1
    .thenReturn(response2)   // Lần 2
    .thenReturn(response3);  // Lần 3+

// Hoặc dùng varargs:
when(authService.authenticate(any()))
    .thenReturn(response1, response2, response3);

// Calls
authService.authenticate(req);  // → response1
authService.authenticate(req);  // → response2
authService.authenticate(req);  // → response3
authService.authenticate(req);  // → response3 (repeat last)
```

Em thấy style `when().thenReturn()` rõ ràng và type-safe hơn nên dùng trong project này ạ!

### **18. Verify Mock Interactions**
**Câu hỏi:** Trong `ProductServiceTest` (mock), em dùng `verify()`:
- `verify(productRepository).existsByName("Điện thoại iPhone 15")` - nó verify cái gì?
- `verify(productRepository, never()).save()` khác gì với việc không verify?
- Nếu em quên verify một interaction quan trọng, test vẫn pass - có cách nào phát hiện?

**Trả lời:**

**verify() hoạt động như thế nào:**
`verify()` kiểm tra xem mock method **ĐÃ ĐƯỢC GỌI** hay chưa ạ thầy:

```java
@Test
void testCreateFailNameExists() {
    ProductRequest request = new ProductRequest("Điện thoại iPhone 15", ...);
    
    when(productRepository.existsByName("Điện thoại iPhone 15"))
        .thenReturn(true);
    
    // Act
    assertThrows(ExistsException.class, () -> {
        productService.create(request);
    });
    
    // Verify interactions
    verify(productRepository).existsByName("Điện thoại iPhone 15");
    verify(productRepository, never()).save(any(ProductEntity.class));
}
```

**Cụ thể verify() check:**
1. **Method có được gọi không**: `existsByName()` phải được gọi ít nhất 1 lần
2. **Arguments đúng không**: Phải pass exact string "Điện thoại iPhone 15"
3. **Số lần gọi** (default = 1 lần)

Nếu không match → test FAIL với lỗi:
```
Wanted but not invoked:
productRepository.existsByName("Điện thoại iPhone 15");

Actually, there were zero interactions with this mock.
```

**verify() vs stub (when):**
- `when()`: Setup behavior - "Khi gọi method X thì return Y"
- `verify()`: Assert interaction - "Method X ĐÃ ĐƯỢC GỌI với args Z"

**verify(repo, never()).save():**

```java
verify(productRepository, never()).save(any());
```

**Verify cái gì:**
- Method `save()` **KHÔNG BAO GIỜ** được gọi trong test
- Nếu có gọi → test FAIL

**Khác gì với không verify:**

```java
// Cách 1: Verify never()
verify(productRepository, never()).save(any());
// ✅ Explicit assertion: "save() KHÔNG được gọi"
// ❌ Nếu gọi → TEST FAIL

// Cách 2: Không verify gì cả
// (không có verify statement)
// ⚠️ Implicit assumption: "không care save() có gọi hay không"
// ✅ Nếu gọi → TEST PASS
```

**Ví dụ thực tế:**

```java
@Test
void testCreateFailNameExists() {
    when(productRepository.existsByName(any())).thenReturn(true);
    
    assertThrows(ExistsException.class, () -> {
        productService.create(request);
    });
    
    // Scenario 1: Không verify
    // → Test PASS dù có bug: service vẫn save() khi name exists!
    
    // Scenario 2: Verify never()
    verify(productRepository, never()).save(any());
    // → Test FAIL nếu có bug → phát hiện được bug!
}
```

**Use cases cho never():**
- ✅ Verify method KHÔNG được gọi trong error cases
- ✅ Verify optimization (skip unnecessary calls)
- ✅ Verify security (sensitive method không được gọi)
- ✅ Document expected behavior

**Nếu quên verify interaction quan trọng:**

Đây là **vấn đề lớn** của interaction-based testing ạ thầy:

```java
// Bug trong ProductService
public ProductEntity create(ProductRequest req) {
    // ❌ Bug: Quên check exists
    // if (repo.existsByName(req.getName())) throw ...
    
    return repo.save(ProductMapper.toEntity(req));  // Save luôn!
}

// Test thiếu verify
@Test
void testCreate() {
    when(repo.save(any())).thenReturn(savedProduct);
    
    ProductEntity result = productService.create(request);
    
    assertNotNull(result);  // ✅ PASS
    // ⚠️ Quên verify existsByName() được gọi
    // → Không phát hiện bug!
}
```

Test PASS nhưng có bug vì:
- Không verify `existsByName()` được gọi
- Chỉ assert kết quả cuối cùng
- Bug logic không được phát hiện

**Cách phát hiện missing verifications:**

*1. Code review:*
```java
// Review checklist:
// - Mọi stub (when) phải có verify tương ứng
// - Critical business logic phải được verify
```

*2. Strict stubs (Mockito 2+):*
```java
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.STRICT_STUBS)
public class ProductServiceTest {
    // Nếu stub nhưng không gọi → warning
}
```

*3. Verify zero interactions:*
```java
@Test
void testSomething() {
    // ... test logic ...
    
    // Verify chỉ expected interactions xảy ra
    verify(productRepository).existsByName(any());
    verify(productRepository).save(any());
    verifyNoMoreInteractions(productRepository);  // Không có gọi gì khác
}
```

*4. Verification modes:*
```java
// Verify exact số lần
verify(repo, times(1)).existsByName(any());
verify(repo, times(2)).findById(any());
verify(repo, atLeast(1)).save(any());
verify(repo, atMost(3)).findAll();
verify(repo, never()).delete(any());

// Verify order
InOrder inOrder = inOrder(repo);
inOrder.verify(repo).existsByName(any());  // Gọi trước
inOrder.verify(repo).save(any());          // Gọi sau
```

**Best practices trong project em:**

```java
@Test
void testCreateSuccess() {
    // Arrange
    when(productRepository.existsByName("Product")).thenReturn(false);
    when(productRepository.save(any())).thenReturn(savedProduct);
    
    // Act
    ProductEntity result = productService.create(request);
    
    // Assert - BEHAVIORAL
    assertNotNull(result);
    assertEquals("Product", result.getName());
    
    // Verify - INTERACTION (optional but good)
    verify(productRepository).existsByName("Product");  // ✅ Business logic check
    verify(productRepository).save(any());              // ✅ Persistence call
}
```

**Trade-off:**
- Too many verify() → brittle tests, coupled to implementation
- Too few verify() → miss bugs in interaction logic

Em cố gắng balance: verify critical interactions, không verify mọi thứ!

### **19. ArgumentCaptor Usage**
**Câu hỏi:**
- Em có dùng `ArgumentCaptor` ở đâu không? Nếu không, em biết nó dùng để làm gì?
- Trong test create product, làm sao capture được ProductEntity được pass vào `save()` để verify từng field?
- ArgumentCaptor vs ArgumentMatcher - khác nhau và khi nào dùng cái nào?

**Trả lời:**

**Em có dùng ArgumentCaptor không:**
Em **CHƯA** dùng ArgumentCaptor trong project ạ thầy. Hiện tại em chỉ dùng argument matchers như `any()`, `eq()`.

**ArgumentCaptor dùng để làm gì:**
ArgumentCaptor **capture arguments** được pass vào mock method để verify chi tiết:

```java
// Thay vì:
verify(repo).save(any());  // ⚠️ Chỉ verify method được gọi

// Dùng ArgumentCaptor:
ArgumentCaptor<ProductEntity> captor = ArgumentCaptor.forClass(ProductEntity.class);
verify(repo).save(captor.capture());

ProductEntity captured = captor.getValue();
assertEquals("Product Name", captured.getName());      // ✅ Verify field
assertEquals(BigDecimal.valueOf(100), captured.getPrice());
assertEquals(Category.ELECTRONICS, captured.getCategory());
```

**Use cases:**
- Verify complex object fields
- Assert computed values  
- Check transformation logic
- Verify builder patterns

**Capture ProductEntity trong test create:**

Hiện tại em test như này:
```java
@Test
void testCreateSuccess() {
    when(productRepository.save(any())).thenReturn(savedProduct);
    
    ProductEntity result = productService.create(request);
    
    assertNotNull(result);
    verify(productRepository).save(any());  // ⚠️ Không verify ProductEntity details
}
```

**Cải thiện với ArgumentCaptor:**
```java
@Test
void testCreateSuccess() {
    // Arrange
    ProductRequest request = new ProductRequest(
        "Laptop Dell XPS",
        new BigDecimal("35000000"),
        50,
        "High-end laptop",
        Category.DIEN_TU
    );
    
    ProductEntity savedProduct = ProductEntity.builder()
        .id(1L)
        .name("Laptop Dell XPS")
        .price(new BigDecimal("35000000"))
        .quantity(50)
        .build();
    
    when(productRepository.existsByName(any())).thenReturn(false);
    when(productRepository.save(any())).thenReturn(savedProduct);
    
    // Act
    ProductEntity result = productService.create(request);
    
    // Assert result
    assertNotNull(result);
    assertEquals(1L, result.getId());
    
    // Capture argument passed to save()
    ArgumentCaptor<ProductEntity> captor = 
        ArgumentCaptor.forClass(ProductEntity.class);
    verify(productRepository).save(captor.capture());
    
    // Verify ProductEntity was mapped correctly
    ProductEntity captured = captor.getValue();
    assertEquals("Laptop Dell XPS", captured.getName());
    assertEquals(new BigDecimal("35000000"), captured.getPrice());
    assertEquals(50, captured.getQuantity());
    assertEquals("High-end laptop", captured.getDescription());
    assertEquals(Category.DIEN_TU, captured.getCategory());
    assertNull(captured.getId());  // ID chưa được set trước khi save
}
```

**Benefits:**
- ✅ Verify mapping logic (Request → Entity)
- ✅ Ensure all fields được set đúng
- ✅ Catch bugs trong ProductMapper
- ✅ Test transformation logic

**ArgumentCaptor vs ArgumentMatcher:**

*ArgumentMatcher (`any()`, `eq()`, `argThat()`):*
```java
// Match conditions
verify(repo).save(any(ProductEntity.class));           // Bất kỳ ProductEntity
verify(repo).save(eq(specificProduct));                // Exact object
verify(repo).save(argThat(p -> p.getPrice() > 0));    // Custom condition
```

**Đặc điểm:**
- ✅ Verify conditions/predicates
- ✅ Flexible matching
- ✅ Good for when/stub
- ❌ Không access được actual value
- ❌ Không assert multiple fields

*ArgumentCaptor:*
```java
// Capture actual value
ArgumentCaptor<ProductEntity> captor = ArgumentCaptor.forClass(ProductEntity.class);
verify(repo).save(captor.capture());

ProductEntity actual = captor.getValue();  // ✅ Get actual object
// Assert whatever you want
```

**Đặc điểm:**
- ✅ Access actual argument
- ✅ Assert multiple fields
- ✅ Inspect complex objects
- ❌ Only for verify, không dùng cho when/stub
- ❌ Verbose

**Khi nào dùng cái nào:**

*Dùng ArgumentMatcher khi:*
```java
// Simple verification
verify(repo).save(any());  // ✅ Chỉ cần biết được gọi

// Condition-based  
verify(repo).save(argThat(p -> p.getPrice().compareTo(BigDecimal.ZERO) > 0));

// Stub behavior
when(repo.findByName(anyString())).thenReturn(product);
```

*Dùng ArgumentCaptor khi:*
```java
// Need actual value for assertions
ArgumentCaptor<ProductEntity> captor = ArgumentCaptor.forClass(ProductEntity.class);
verify(repo).save(captor.capture());
assertEquals(expected, captor.getValue());

// Multiple field assertions
ProductEntity actual = captor.getValue();
assertAll(
    () -> assertEquals("Name", actual.getName()),
    () -> assertEquals(100, actual.getQuantity()),
    () -> assertTrue(actual.getPrice().compareTo(BigDecimal.ZERO) > 0)
);

// Capture múltiple calls
verify(repo, times(3)).save(captor.capture());
List<ProductEntity> allCaptures = captor.getAllValues();
assertEquals(3, allCaptures.size());
```

**Advanced example - capture trong update:**
```java
@Test
void testUpdateProduct() {
    // Arrange
    ProductEntity existingProduct = ProductEntity.builder()
        .id(1L)
        .name("Old Name")
        .price(BigDecimal.valueOf(1000))
        .quantity(10)
        .build();
    
    ProductRequest updateRequest = new ProductRequest(
        "New Name",
        BigDecimal.valueOf(2000),
        20,
        "Updated",
        Category.DIEN_TU
    );
    
    when(productRepository.findById(1L))
        .thenReturn(Optional.of(existingProduct));
    when(productRepository.existsByName("New Name"))
        .thenReturn(false);
    when(productRepository.save(any()))
        .thenAnswer(invocation -> invocation.getArgument(0));
    
    // Act
    productService.update(1L, updateRequest);
    
    // Capture saved entity
    ArgumentCaptor<ProductEntity> captor = 
        ArgumentCaptor.forClass(ProductEntity.class);
    verify(productRepository).save(captor.capture());
    
    // Verify entity was updated correctly
    ProductEntity updated = captor.getValue();
    assertEquals(1L, updated.getId());           // ID unchanged
    assertEquals("New Name", updated.getName()); // Name updated
    assertEquals(BigDecimal.valueOf(2000), updated.getPrice());
    assertEquals(20, updated.getQuantity());
}
```

**Em nên refactor tests để dùng ArgumentCaptor:**
- Test mapping logic (Request → Entity)
- Test update logic (partial updates)
- Test builder patterns
- Verify computed fields

Nhưng không over-use vì làm tests verbose. Balance giữa ArgumentCaptor (chi tiết) và ArgumentMatcher (concise) ạ!

### **20. Mock vs Spy**
**Câu hỏi:**
- Em toàn dùng `@Mock` - khi nào nên dùng `@Spy`?
- Nếu em muốn mock chỉ 1 method của ProductService nhưng giữ nguyên logic các method khác, làm thế nào?
- Spy có performance overhead gì so với Mock không?

**Trả lời:**

**Mock vs Spy - Khác biệt căn bản:**

*@Mock - Fake object hoàn toàn:*
```java
@Mock
private ProductRepository productRepository;

// ALL methods return default values (null, 0, false, empty collection)
productRepository.findById(1L);      // → null (chưa stub)
productRepository.existsByName("x"); // → false (default)
productRepository.count();           // → 0 (default)
```

**Đặc điểm:**
- Không có logic thật nào cả
- Mọi method phải stub thủ công
- Lightweight, fast
- Dùng cho dependencies

*@Spy - Partial mock (real object):*
```java
@Spy
private ProductService productService;

// Real methods được gọi UNLESS stubbed
productService.getAll();           // → Gọi method thật
productService.getById(1L);        // → Gọi method thật

// Nhưng có thể stub specific methods
when(productService.getById(1L)).thenReturn(product);
productService.getById(1L);        // → Return stubbed value
productService.getAll();           // → Vẫn gọi method thật
```

**Đặc điểm:**
- Real object với real implementation
- Có thể override specific methods
- Heavier, có side effects
- Dùng để test class under test

**Khi nào dùng Spy:**

*Use case 1: Partial mocking*
```java
// Muốn test createBatch() nhưng mock create()
@Spy
private ProductService productService;

@Test
void testCreateBatch() {
    List<ProductRequest> requests = Arrays.asList(req1, req2, req3);
    
    // Mock create() để tránh database call
    doReturn(product1).when(productService).create(req1);
    doReturn(product2).when(productService).create(req2);
    doReturn(product3).when(productService).create(req3);
    
    // Test createBatch() - gọi real method
    List<ProductEntity> results = productService.createBatch(requests);
    
    assertEquals(3, results.size());
    verify(productService, times(3)).create(any());
}
```

*Use case 2: Test private method indirectly*
```java
public class ProductService {
    public List<Product> getAllActive() {
        return filterActive(getAll());  // Private helper
    }
    
    private List<Product> filterActive(List<Product> products) {
        // Complex logic
    }
}

@Spy
private ProductService spy;

@Test
void testGetAllActive() {
    // Stub getAll(), test filterActive() indirectly
    doReturn(allProducts).when(spy).getAll();
    
    List<Product> active = spy.getAllActive();  // Calls real filterActive()
    
    // Verify filtering logic worked
    assertTrue(active.stream().allMatch(Product::isActive));
}
```

*Use case 3: Verify method calls on real object*
```java
@Spy
private ProductService spy = new ProductService(realRepo);

@Test
void testUpdateCallsGetById() {
    when(realRepo.findById(1L)).thenReturn(Optional.of(product));
    
    spy.update(1L, request);
    
    // Verify spy gọi getById()
    verify(spy).getById(1L);  // ✅ Can verify calls on spy
}
```

**Mock chỉ 1 method của ProductService:**

```java
// Approach 1: Spy
@Spy
private ProductService productService;

@Mock
private ProductRepository productRepository;

@BeforeEach
void setUp() {
    // Inject mock repo vào spy service
    productService = spy(new ProductService(productRepository));
}

@Test
void testSomething() {
    // Mock chỉ getById(), giữ nguyên logic create(), update(), delete()
    doReturn(mockProduct).when(productService).getById(1L);
    
    // Gọi update() - uses real logic + mocked getById()
    productService.update(1L, request);
    
    verify(productService).getById(1L);  // Mocked
    verify(productRepository).save(any());  // Real logic called this
}

// Approach 2: Partial mock với Mockito.spy()
@Test
void testWithPartialMock() {
    ProductRepository realRepo = mock(ProductRepository.class);
    ProductService service = new ProductService(realRepo);
    ProductService spy = spy(service);
    
    // Override chỉ 1 method
    doReturn(product).when(spy).getById(anyLong());
    
    // Methods khác vẫn real
    spy.create(request);  // Real method
    spy.update(1L, request);  // Uses mocked getById() internally
}
```

**Performance overhead của Spy:**

*Mock (lightweight):*
```java
@Mock
private ProductRepository repo;
// → Tạo proxy object rỗng
// → ~0.1ms creation time
// → Minimal memory footprint
```

*Spy (heavier):*
```java
@Spy
private ProductService service;
// → Tạo REAL object
// → Run constructor + dependency injection
// → ~1-5ms creation time
// → Full object memory + proxy wrapper
// → Side effects nếu constructor complex
```

**Overhead cụ thể:**
1. **Creation time**: Spy ~10x chậm hơn Mock
2. **Memory**: Spy tốn gấp đôi (real object + proxy)
3. **Method calls**: Spy gọi real method → có thể chậm nếu method phức tạp
4. **Side effects**: Constructor của spy chạy thật → có thể gọi database, file I/O, etc.

**Ví dụ minh họa:**
```java
// Mock - fast
@Mock
private HeavyService service;  // Constructor KHÔNG chạy

// Spy - slow & dangerous
@Spy
private HeavyService service = new HeavyService();
// ❌ Constructor chạy:
// - Connect to database
// - Load config files
// - Initialize thread pools
// → Test chậm, có side effects!
```

**Best practices:**

*Prefer Mock (em đang dùng):*
```java
@Mock
private ProductRepository repo;
@Mock
private AuthService authService;
// ✅ Fast, clean, predictable
```

*Use Spy sparingly:*
```java
@Spy
private ProductService productService;
// ⚠️ Only when needed
// - Partial mocking
// - Testing interactions within same class
// - Legacy code without dependency injection
```

**Anti-patterns with Spy:**
```java
// ❌ BAD: Spy on class under test
@Spy
private ProductService serviceUnderTest;

@Test
void test() {
    // Testing real object with mocked methods
    // → Not true unit test
    // → Confusing what's being tested
}

// ✅ GOOD: Mock dependencies, test service normally
@Mock
private ProductRepository repo;

private ProductService service;

@BeforeEach
void setUp() {
    service = new ProductService(repo);  // Real service
}

@Test
void test() {
    // Test real service with mocked dependencies
}
```

**Trong project em:**
Em toàn dùng `@Mock` vì:
- ✅ Test dependencies (Repositories), không test class under test
- ✅ Fast, clean, no side effects
- ✅ Follow unit testing best practices

Em chỉ cần Spy nếu:
- Refactor legacy code không có DI
- Test complex interactions trong cùng class
- Partial mock cho integration tests

Hiện tại approach của em đúng rồi ạ!

### **21. GlobalExceptionHandler trong Mock Test**
**Câu hỏi:** Dòng 48 của `AuthControllerTest` (mock):
```java
mockMvc = MockMvcBuilders.standaloneSetup(loginController)
    .setControllerAdvice(new GlobalExceptionHandler()).build();
```
- Tại sao em phải manually set `ControllerAdvice` trong mock test?
- Nếu em không set, exception sẽ được handle thế nào?
- `standaloneSetup` khác gì với `webAppContextSetup`?

**Trả lời:**

**Tại sao phải manually set ControllerAdvice:**

Trong mock test với `@WebMvcTest`, Spring **KHÔNG** auto-load `@RestControllerAdvice` ạ thầy:

```java
@WebMvcTest(LoginController.class)
public class AuthControllerTest {
    @Mock
    private AuthService authService;
    
    @InjectMocks
    private LoginController loginController;
    
    private MockMvc mockMvc;
    
    @BeforeEach
    void setUp() {
        // ❌ Nếu không set GlobalExceptionHandler:
        mockMvc = MockMvcBuilders.standaloneSetup(loginController).build();
        // → GlobalExceptionHandler KHÔNG được load
        
        // ✅ Phải set manual:
        mockMvc = MockMvcBuilders.standaloneSetup(loginController)
            .setControllerAdvice(new GlobalExceptionHandler())  // ← Manual inject
            .build();
    }
}
```

**Lý do:**
1. `standaloneSetup()` tạo **minimal Spring MVC context**
2. Chỉ load controller được chỉ định (LoginController)
3. **KHÔNG** scan for `@ControllerAdvice` beans
4. Phải manually inject để test exception handling

**Nếu không set GlobalExceptionHandler:**

```java
// Setup WITHOUT ControllerAdvice
mockMvc = MockMvcBuilders.standaloneSetup(loginController).build();

@Test
void testLoginUserNotFound() throws Exception {
    when(authService.authenticate(any()))
        .thenThrow(new NotFoundException("User not found"));
    
    mockMvc.perform(post("/auth/login")
            .content(json))
        .andExpect(status().isNotFound())  // ❌ FAIL!
        .andExpect(jsonPath("$.message").value("User not found"));  // ❌ FAIL!
}
```

**Chuyện gì xảy ra:**
1. AuthService throw `NotFoundException`
2. LoginController không catch
3. Exception bubble up đến Spring MVC
4. **GlobalExceptionHandler KHÔNG tồn tại** → không handle
5. Spring MVC's default handler xử lý:
   - Return HTTP 500 Internal Server Error (không phải 404!)
   - Response body là Spring Boot error page (HTML hoặc default JSON)
   - Không có custom ErrorResponse format

**Response actual:**
```json
{
  "timestamp": "2025-12-02T...",
  "status": 500,
  "error": "Internal Server Error",
  "message": "NotFoundException: User not found",
  "path": "/auth/login"
}
```

**Expected response:**
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

→ Test FAIL vì status code và response structure khác!

**standaloneSetup vs webAppContextSetup:**

*standaloneSetup (em đang dùng trong mock test):*
```java
mockMvc = MockMvcBuilders.standaloneSetup(loginController)
    .setControllerAdvice(new GlobalExceptionHandler())
    .build();
```

**Đặc điểm:**
- ✅ **Lightweight**: Không load Spring context
- ✅ **Fast**: ~100-200ms setup
- ✅ **Isolated**: Chỉ test controller logic
- ✅ **Manual control**: Explicit dependencies
- ❌ **Manual setup**: Phải inject ControllerAdvice, filters, converters
- ❌ **Not full integration**: Không test Spring wiring

**Use cases:**
- Unit test controller với mocked services
- Fast feedback loop
- Test controller logic only

*webAppContextSetup (dùng trong integration test):*
```java
@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerIntegrationTest {
    @Autowired
    private WebApplicationContext webAppContext;
    
    @Autowired
    private MockMvc mockMvc;  // Auto-configured
    
    // Hoặc manual:
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webAppContext).build();
    }
}
```

**Đặc điểm:**
- ✅ **Full Spring context**: Load all beans, configs
- ✅ **Auto-discovery**: ControllerAdvice, Filters tự động load
- ✅ **Real integration**: Test Spring wiring, configs
- ✅ **Realistic**: Giống production environment
- ❌ **Slow**: ~2-5 seconds setup
- ❌ **Heavy**: Load full application context

**Use cases:**
- Integration test toàn bộ stack
- Test Spring Security integration
- Test filters, interceptors
- E2E controller tests

**So sánh cụ thể:**

| Aspect | standaloneSetup | webAppContextSetup |
|--------|----------------|-------------------|
| Speed | ⚡ Fast (~100ms) | 🐌 Slow (~2-5s) |
| Context | Minimal | Full Spring |
| ControllerAdvice | ❌ Manual inject | ✅ Auto-loaded |
| Filters | ❌ Manual add | ✅ Auto-loaded |
| Security | ❌ Not included | ✅ Included |
| Dependency Injection | ❌ Manual mock | ✅ Real beans |
| Use case | Unit test | Integration test |

**Ví dụ so sánh:**

*standaloneSetup - Mock test:*
```java
@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {
    @Mock
    private AuthService authService;
    
    @InjectMocks
    private LoginController controller;
    
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
            .standaloneSetup(controller)
            .setControllerAdvice(new GlobalExceptionHandler())  // Manual
            .addFilters(new CorsFilter())  // Manual nếu cần
            .build();
    }
}
```

*webAppContextSetup - Integration test:*
```java
@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;  // ✅ Tất cả đã setup sẵn
    
    // GlobalExceptionHandler tự động load
    // Filters tự động load
    // Security tự động setup
}
```

**Best practices trong project em:**

*Mock tests (fast, isolated):*
```java
// ✅ standaloneSetup + manual ControllerAdvice
mockMvc = MockMvcBuilders.standaloneSetup(controller)
    .setControllerAdvice(new GlobalExceptionHandler())
    .build();
```

*Integration tests (realistic):*
```java
// ✅ webAppContextSetup hoặc @AutoConfigureMockMvc
@SpringBootTest
@AutoConfigureMockMvc
// Spring tự động setup everything
```

**Em đã làm đúng** khi set GlobalExceptionHandler manually trong standaloneSetup. Đây là required để test exception handling trong unit tests ạ!

---

### **D. Test Design & Best Practices (5 câu)**

### **22. AAA Pattern (Arrange-Act-Assert)**
**Câu hỏi:**
- Em có follow AAA pattern trong test không? Cho ví dụ cụ thể từ code của em?
- Tại sao nên tách biệt 3 phase này? Lợi ích gì?
- Nếu em cần nhiều assertions, có nên tách thành nhiều test methods không?

**Trả lời:**

**Em có follow AAA pattern:**
**CÓ** ạ thầy, em follow AAA pattern trong tất cả tests:

```java
@Test
@DisplayName("TC_LOGIN_001: Đăng nhập thành công với credentials hợp lệ")
void testLoginSuccess() {
    // ========== ARRANGE ==========
    // Setup test data & mocks
    LoginRequest loginRequest = new LoginRequest("hyan123", "password123");
    
    // ========== ACT ==========
    // Execute the method under test
    LoginResponse response = authService.authenticate(loginRequest);
    
    // ========== ASSERT ==========
    // Verify the results
    assertTrue(response.isSuccess());
    assertEquals("Đăng nhập thành công", response.getMessage());
    assertNotNull(response.getToken());
    assertEquals("hyan123", response.getUserResponse().getUsername());
}
```

**Ví dụ khác từ ProductService:**
```java
@Test
@DisplayName("TC_PRODUCT_001: Tạo sản phẩm thành công với dữ liệu hợp lệ")
void testCreateSuccess() {
    // ========== ARRANGE ==========
    ProductRequest request = new ProductRequest(
        "Laptop Dell XPS 15",
        new BigDecimal("35000000"),
        50,
        "Laptop cao cấp",
        Category.DIEN_TU
    );
    
    // ========== ACT ==========
    ProductEntity result = productService.create(request);
    
    // ========== ASSERT ==========
    assertNotNull(result);
    assertEquals("Laptop Dell XPS 15", result.getName());
    assertEquals(new BigDecimal("35000000"), result.getPrice());
    assertEquals(50, result.getQuantity());
    assertEquals(Category.DIEN_TU, result.getCategory());
}
```

**Ví dụ với Mock test:**
```java
@Test
@DisplayName("TC_PRODUCT_002: Tạo sản phẩm thất bại khi tên đã tồn tại")
void testCreateFailNameExists() {
    // ========== ARRANGE ==========
    ProductRequest request = new ProductRequest("Điện thoại iPhone 15", ...);
    when(productRepository.existsByName("Điện thoại iPhone 15")).thenReturn(true);
    
    // ========== ACT ==========
    ExistsException exception = assertThrows(ExistsException.class, () -> {
        productService.create(request);
    });
    
    // ========== ASSERT ==========
    assertEquals("Tên sản phẩm đã tồn tại", exception.getMessage());
    verify(productRepository).existsByName("Điện thoại iPhone 15");
    verify(productRepository, never()).save(any(ProductEntity.class));
}
```

**Tại sao tách biệt 3 phases:**

*1. Readability - Dễ đọc, dễ hiểu:*
```java
// ✅ Good - Clear AAA structure
@Test
void testUpdate() {
    // Arrange
    Product existing = createProduct();
    UpdateRequest request = new UpdateRequest(...);
    
    // Act
    Product updated = service.update(existing.getId(), request);
    
    // Assert
    assertEquals(request.getName(), updated.getName());
}

// ❌ Bad - Mixed phases
@Test
void testUpdate() {
    Product product = service.update(
        createProduct().getId(),  // Arrange + Act mixed
        new UpdateRequest(...)
    );
    assertEquals("name", product.getName());  // Assert không rõ
}
```

*2. Debugging - Dễ debug khi fail:*
```java
// Khi test fail, em biết ngay phase nào có vấn đề:
@Test
void test() {
    // Arrange
    User user = userRepository.save(testUser);  // ← Fail ở đây → data setup issue
    
    // Act
    LoginResponse response = authService.login(user);  // ← Fail ở đây → business logic bug
    
    // Assert
    assertTrue(response.isSuccess());  // ← Fail ở đây → wrong expectation
}
```

*3. Maintenance - Dễ modify:*
```java
// Cần thêm test data? → Sửa Arrange section
// Thay đổi cách gọi method? → Sửa Act section
// Update assertions? → Sửa Assert section
```

*4. Single Responsibility - Mỗi phase một nhiệm vụ:*
- **Arrange**: Setup world state
- **Act**: Execute ONE action
- **Assert**: Verify ONE outcome

*5. Testability signal:*
```java
// Nếu Arrange quá dài → method cần quá nhiều setup → code smell
@Test
void test() {
    // Arrange - 50 lines of setup
    // ❌ Signal: method có quá nhiều dependencies
    
    // Act
    // Assert
}
```

**Nếu cần nhiều assertions - tách hay không:**

**Nguyên tắc:** One test, one concept!

*Scenario 1: Assertions verify CÙNG concept → Keep together*
```java
// ✅ Good - All assertions verify "create thành công"
@Test
void testCreateSuccess() {
    ProductEntity result = productService.create(request);
    
    // Verify object created correctly
    assertNotNull(result);
    assertNotNull(result.getId());
    assertEquals("Name", result.getName());
    assertEquals(BigDecimal.valueOf(100), result.getPrice());
    assertEquals(10, result.getQuantity());
    // → Cùng verify "product được tạo với đúng fields"
}
```

*Scenario 2: Assertions verify KHÁC concept → Split tests*
```java
// ❌ Bad - Mixed concerns
@Test
void testCreate() {
    ProductEntity result = productService.create(request);
    
    // Verify creation
    assertNotNull(result);
    
    // Verify persistence
    assertTrue(productRepository.existsById(result.getId()));
    
    // Verify business rule
    assertTrue(result.getPrice().compareTo(BigDecimal.ZERO) > 0);
    
    // Verify audit
    assertNotNull(result.getCreatedAt());
    // → Test quá nhiều concepts!
}

// ✅ Good - Split into focused tests
@Test
void testCreate_ReturnsProductWithAllFields() {
    // Verify creation logic
}

@Test
void testCreate_PersistsToDatabase() {
    // Verify persistence
}

@Test
void testCreate_EnforcesPricePositive() {
    // Verify business rule
}

@Test
void testCreate_SetsAuditTimestamp() {
    // Verify audit
}
```

**Using assertAll() for related assertions:**
```java
// ✅ Group related assertions
@Test
void testCreateSuccess() {
    ProductEntity result = productService.create(request);
    
    assertAll("Product fields",
        () -> assertNotNull(result.getId()),
        () -> assertEquals("Name", result.getName()),
        () -> assertEquals(BigDecimal.valueOf(100), result.getPrice()),
        () -> assertEquals(10, result.getQuantity())
    );
    // → Tất cả assertions chạy, report all failures cùng lúc
}
```

**Trade-offs:**

*Many assertions in one test:*
- ✅ Less code duplication
- ✅ Faster execution (one setup)
- ❌ Hard to identify which assertion failed
- ❌ First failure stops remaining assertions

*Split into multiple tests:*
- ✅ Clear failure messages
- ✅ Each test focused
- ✅ Better documentation
- ❌ More code
- ❌ Slower (multiple setups)

**Best practice trong project em:**
```java
// ✅ Em group related assertions:
@Test
void testLoginSuccess() {
    LoginResponse response = authService.authenticate(request);
    
    // All verify "login response correctness"
    assertTrue(response.isSuccess());
    assertEquals("Đăng nhập thành công", response.getMessage());
    assertNotNull(response.getToken());
    assertNotNull(response.getUserResponse());
}

// ✅ Em split different scenarios:
@Test
void testLoginSuccess() { /* ... */ }

@Test
void testLoginFailWrongPassword() { /* ... */ }

@Test
void testLoginFailUserNotFound() { /* ... */ }
```

Em theo rule: **5-7 assertions max per test**. Nếu nhiều hơn → smell của mixed concerns → split tests!

### **23. Test Naming Convention**

**Convention em đang dùng:**

Em follow **hybrid convention** ạ thầy:

```java
// Pattern: test + <Action> + <Scenario>
@Test
void testLoginSuccess() { }

@Test
void testLoginFailWrongPassword() { }

@Test
void testCreateSuccess() { }

@Test
void testCreateFailNameExists() { }
```

**Lý do chọn convention này:**
- ✅ **Concise**: Ngắn gọn, dễ đọc khi scan test list
- ✅ **Descriptive**: Tên nói lên scenario
- ✅ **IDE-friendly**: Autocomplete tốt với prefix "test"
- ✅ **Consistent**: Tất cả tests đều bắt đầu bằng "test"

**So sánh với Given-When-Then style:**

*Given-When-Then (BDD style):*
```java
@Test
void givenValidCredentials_whenLogin_thenSuccess() { }

@Test
void givenInvalidPassword_whenLogin_thenThrowAuthException() { }

@Test
void givenExistingName_whenCreateProduct_thenThrowExistsException() { }
```

**Đặc điểm:**
- ✅ Very explicit - rõ ràng precondition, action, outcome
- ✅ Self-documenting - đọc như user story
- ✅ BDD-compliant - align với Behavior-Driven Development
- ❌ **Verbose** - tên rất dài, khó đọc trong test explorer
- ❌ Redundant - "when" thường giống tên method đang test

**Ví dụ so sánh:**

```java
// Style của em
@Test
@DisplayName("TC_LOGIN_001: Đăng nhập thành công với credentials hợp lệ")
void testLoginSuccess() { }
// → Tên ngắn, DisplayName giải thích chi tiết

// Given-When-Then style
@Test
void givenValidUsernameAndPassword_whenAuthenticateCalled_thenReturnLoginResponseWithToken() { }
// → Tên dài 80+ chars, hard to scan
```

**Cái nào tốt hơn?**

**Depends on context** ạ thầy:

*Em dùng hybrid (test + DisplayName) vì:*
- ✅ **Best of both worlds**: Tên ngắn + description chi tiết
- ✅ **Vietnamese support**: DisplayName cho phép tiếng Việt
- ✅ **Test case mapping**: DisplayName có TC_LOGIN_001 để trace về test plan
- ✅ **IDE UX**: Test explorer hiển thị gọn, hover thấy DisplayName

```java
// Em's approach
@Test
@DisplayName("TC_LOGIN_001: Đăng nhập thành công với credentials hợp lệ")
void testLoginSuccess() {
    // Arrange
    LoginRequest request = new LoginRequest("hyan123", "password123");
    
    // Act
    LoginResponse response = authService.authenticate(request);
    
    // Assert
    assertTrue(response.isSuccess());
}
```

*Given-When-Then tốt khi:*
- Team follow strict BDD
- Non-technical stakeholders đọc tests
- Generate living documentation
- English-only project

```java
// BDD style tốt cho living docs
@Test
void givenUserExistsInDatabase_whenLoginWithCorrectPassword_thenReturnSuccessResponse() {
    // Test code
}
// → Reads like spec document
```

**@DisplayName bắt buộc không:**

**KHÔNG** bắt buộc ạ, nhưng em recommend dùng:

*Khi KHÔNG cần DisplayName:*
```java
// Test name đủ rõ
@Test
void shouldReturnProductWhenIdExists() { }

@Test
void shouldThrowExceptionWhenNameIsDuplicate() { }
```

*Khi NÊN dùng DisplayName:*
```java
// 1. Non-ASCII characters (tiếng Việt)
@Test
@DisplayName("TC_LOGIN_001: Đăng nhập thành công với credentials hợp lệ")
void testLoginSuccess() { }

// 2. Test case ID mapping
@Test
@DisplayName("TC_PRODUCT_005: Boundary test - price = MAX_VALUE")
void testProductMaxPrice() { }

// 3. Complex scenarios cần explain
@Test
@DisplayName("When user has expired token and retries login, should generate new token and invalidate old one")
void testTokenRefresh() { }

// 4. Special characters/formatting
@Test
@DisplayName("Create product: price > 0 && quantity >= 0 → success")
void testCreateValidation() { }
```

**Benefits của DisplayName:**
- ✅ Test reports đẹp hơn
- ✅ Support Unicode
- ✅ Flexible formatting
- ✅ Documentation generation
- ✅ Trace to requirements

**Best practice trong project em:**
```java
// ✅ Consistent pattern
@Test
@DisplayName("TC_<ID>: <Vietnamese description>")
void test<Action><Scenario>() {
    // Arrange
    // Act  
    // Assert
}

// Example:
@Test
@DisplayName("TC_LOGIN_002: Đăng nhập thất bại với mật khẩu sai")
void testLoginFailWrongPassword() { }
```

---

### **24. Test Data Builders**

**Em có implement Test Data Builder không:**

Em **CHƯA** implement pattern này một cách formal ạ thầy. Hiện tại em tạo test data trực tiếp trong setUp() hoặc trong từng test:

```java
// Current approach - No builder
@BeforeEach
void setUp() {
    testUser = new UserEntity();
    testUser.setUsername("Hyan2005");
    testUser.setPassword("sugoi123");
    testUser.setMail("hyan123@gmail.com");
}

@Test
void testCreateProduct() {
    ProductRequest request = new ProductRequest(
        "Laptop Dell XPS 15",
        new BigDecimal("35000000"),
        50,
        "Laptop cao cấp",
        Category.DIEN_TU
    );
    // ...
}
```

**Vấn đề với approach hiện tại:**
- ❌ **Duplication**: Mỗi test tạo object giống nhau
- ❌ **Verbose**: 5-6 lines cho mỗi object
- ❌ **Hard to modify**: Thay đổi 1 field phải sửa nhiều chỗ
- ❌ **No default values**: Phải set tất cả fields mỗi lần

**Test Data Builder pattern:**

```java
// Builder class
public class ProductRequestBuilder {
    private String name = "Default Product";
    private BigDecimal price = BigDecimal.valueOf(100000);
    private Integer quantity = 10;
    private String description = "Default description";
    private Category category = Category.DIEN_TU;
    
    public static ProductRequestBuilder aProductRequest() {
        return new ProductRequestBuilder();
    }
    
    public ProductRequestBuilder withName(String name) {
        this.name = name;
        return this;
    }
    
    public ProductRequestBuilder withPrice(BigDecimal price) {
        this.price = price;
        return this;
    }
    
    public ProductRequestBuilder withQuantity(Integer quantity) {
        this.quantity = quantity;
        return this;
    }
    
    public ProductRequestBuilder withDescription(String description) {
        this.description = description;
        return this;
    }
    
    public ProductRequestBuilder withCategory(Category category) {
        this.category = category;
        return this;
    }
    
    public ProductRequest build() {
        return new ProductRequest(name, price, quantity, description, category);
    }
}

// Usage trong test
@Test
void testCreateSuccess() {
    // ✅ Concise, readable
    ProductRequest request = aProductRequest()
        .withName("Laptop Dell XPS")
        .withPrice(BigDecimal.valueOf(35000000))
        .build();
    
    ProductEntity result = productService.create(request);
    assertNotNull(result);
}

@Test
void testCreateMinPrice() {
    // ✅ Override chỉ field quan tâm
    ProductRequest request = aProductRequest()
        .withPrice(BigDecimal.ONE)
        .build();
    // Các fields khác dùng default
}
```

**Cách tránh duplication:**

*Approach 1: Test Data Builder (recommended)*
```java
// Em nên implement như trên
ProductRequest laptop = aProductRequest()
    .withName("Laptop")
    .withCategory(Category.DIEN_TU)
    .build();

ProductRequest tshirt = aProductRequest()
    .withName("Áo thun")
    .withCategory(Category.THOI_TRANG)
    .withPrice(BigDecimal.valueOf(200000))
    .build();
```

*Approach 2: Factory methods*
```java
public class TestDataFactory {
    public static ProductRequest createValidProductRequest() {
        return new ProductRequest(
            "Test Product",
            BigDecimal.valueOf(100000),
            10,
            "Description",
            Category.DIEN_TU
        );
    }
    
    public static ProductRequest createProductWithName(String name) {
        return new ProductRequest(name, BigDecimal.valueOf(100000), 10, "Desc", Category.DIEN_TU);
    }
}

// Usage
@Test
void test() {
    ProductRequest request = createValidProductRequest();
    // Nhưng không flexible như Builder
}
```

*Approach 3: Object Mother pattern*
```java
public class ProductMother {
    public static ProductRequest laptop() {
        return new ProductRequest("Laptop", BigDecimal.valueOf(20000000), 5, "Laptop", Category.DIEN_TU);
    }
    
    public static ProductRequest phone() {
        return new ProductRequest("iPhone", BigDecimal.valueOf(25000000), 10, "Phone", Category.DIEN_TU);
    }
    
    public static ProductRequest tshirt() {
        return new ProductRequest("Áo thun", BigDecimal.valueOf(200000), 100, "T-shirt", Category.THOI_TRANG);
    }
}

// Usage
@Test
void test() {
    ProductRequest laptop = ProductMother.laptop();
    // ✅ Expressive nhưng ❌ không flexible
}
```

**Builder pattern giúp gì cho test readability:**

*1. Fluent API - đọc như câu văn:*
```java
// ✅ Reads naturally
ProductRequest request = aProductRequest()
    .withName("Laptop Dell XPS")
    .withPrice(BigDecimal.valueOf(35000000))
    .withQuantity(5)
    .build();

// vs ❌ Constructor hell
ProductRequest request = new ProductRequest(
    "Laptop Dell XPS",           // name
    BigDecimal.valueOf(35000000), // price  
    5,                            // quantity
    "High-end laptop",            // description - unclear
    Category.DIEN_TU              // category
);
```

*2. Named parameters - self-documenting:*
```java
// ✅ Clear intent
.withPrice(BigDecimal.ZERO)      // Testing boundary
.withQuantity(Integer.MAX_VALUE) // Testing edge case

// vs ❌ Magic numbers
new ProductRequest("x", BigDecimal.ZERO, Integer.MAX_VALUE, "x", CAT)
// → What are these values?
```

*3. Default values - focus on what matters:*
```java
// ✅ Test price validation only
@Test
void testPriceNegative() {
    ProductRequest request = aProductRequest()
        .withPrice(BigDecimal.valueOf(-100))  // Only set relevant field
        .build();
    
    assertThrows(ValidationException.class, () -> {
        productService.create(request);
    });
}

// vs ❌ Noise
@Test
void testPriceNegative() {
    ProductRequest request = new ProductRequest(
        "Product",                    // Not relevant to test
        BigDecimal.valueOf(-100),     // THIS is what we test
        10,                           // Not relevant
        "Description",                // Not relevant
        Category.DIEN_TU             // Not relevant
    );
}
```

*4. Reusable test data:*
```java
// ✅ Reuse trong nhiều tests
public static ProductRequestBuilder validLaptop() {
    return aProductRequest()
        .withName("Laptop")
        .withCategory(Category.DIEN_TU)
        .withPrice(BigDecimal.valueOf(20000000));
}

@Test
void testCreate() {
    ProductRequest request = validLaptop().build();
}

@Test
void testUpdate() {
    ProductRequest updated = validLaptop()
        .withPrice(BigDecimal.valueOf(25000000))
        .build();
}
```

**Em nên refactor để dùng Builder:**
```java
// Test data builders
public class Builders {
    public static ProductRequestBuilder aProductRequest() { }
    public static UserEntityBuilder aUser() { }
    public static LoginRequestBuilder aLoginRequest() { }
}

// Import static
import static com.flogin.test.Builders.*;

// Usage
@Test
void test() {
    ProductRequest request = aProductRequest()
        .withName("Laptop")
        .build();
        
    UserEntity user = aUser()
        .withUsername("testuser")
        .build();
}
```

---

### **25. Flaky Tests**

**Test phụ thuộc thời gian:**

Em **CÓ** một số tests có potential flakiness ạ thầy:

*1. JWT Token expiration:*
```java
// JwtTokenProvider.java
@Value("${app.jwt.expiration}")
private long jwtExpiration;  // e.g., 3600000ms = 1 hour

public String generateToken(String username) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + jwtExpiration);
    return Jwts.builder()
        .setExpiration(expiryDate)
        .build();
}
```

**Potential flaky test:**
```java
@Test
void testTokenExpiration() {
    String token = jwtTokenProvider.generateToken("user");
    
    // Sleep until expiration
    Thread.sleep(jwtExpiration + 1000);  // ❌ FLAKY!
    
    assertFalse(jwtTokenProvider.validateToken(token));
}
```

**Why flaky:**
- Timing-dependent
- System clock variations
- CI/CD environment differences
- Test duration unpredictable

*2. Transaction timing:*
```java
@Test
@Transactional
void testConcurrentUpdates() {
    productService.update(1L, request1);  // Thread 1
    productService.update(1L, request2);  // Thread 2
    // ❌ Race condition nếu run parallel
}
```

*3. Database state:*
```java
@Test
void testCreateAfterDelete() {
    productService.create(product);
    productService.delete(product.getId());
    
    // ❌ Có thể fail nếu delete chưa commit
    productService.create(product);  // Unique constraint violation
}
```

**Strategy để đảm bảo không flaky:**

*1. Mock time-dependent code:*
```java
// ✅ Inject Clock để mock time
public class JwtTokenProvider {
    private final Clock clock;
    
    public String generateToken(String username) {
        Instant now = clock.instant();  // Injectable
        Instant expiry = now.plusMillis(jwtExpiration);
        return Jwts.builder()
            .setExpiration(Date.from(expiry))
            .build();
    }
}

// Test with fixed clock
@Test
void testTokenExpiration() {
    Clock fixedClock = Clock.fixed(Instant.parse("2025-12-02T10:00:00Z"), ZoneOffset.UTC);
    JwtTokenProvider provider = new JwtTokenProvider(fixedClock);
    
    String token = provider.generateToken("user");
    
    // Advance clock
    Clock expiredClock = Clock.fixed(Instant.parse("2025-12-02T11:01:00Z"), ZoneOffset.UTC);
    provider = new JwtTokenProvider(expiredClock);
    
    assertFalse(provider.validateToken(token));  // ✅ Deterministic
}
```

*2. Use @Transactional cho test isolation:*
```java
@Test
@Transactional  // ✅ Auto rollback
void testCreate() {
    productService.create(product);
    // State clean sau test
}
```

*3. Avoid Thread.sleep(), use polling:*
```java
// ❌ Bad - flaky
Thread.sleep(5000);
assertTrue(condition);

// ✅ Good - await with timeout
await().atMost(5, SECONDS)
    .pollInterval(100, MILLISECONDS)
    .until(() -> condition);
```

*4. Use test containers cho database:*
```java
@Testcontainers
@SpringBootTest
class IntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");
    
    // ✅ Fresh database mỗi test run
}
```

*5. Parallel test isolation:*
```java
@Test
@Execution(ExecutionMode.SAME_THREAD)  // ✅ Force sequential
void testConcurrentUpdate() { }
```

**Strategy detect flaky tests:**

*1. Run tests nhiều lần:*
```bash
# Run test suite 10 lần
mvn test -Dsurefire.rerunFailingTestsCount=10

# Hoặc script
for i in {1..10}; do
    mvn test || echo "Failed on run $i"
done
```

*2. CI/CD tracking:*
```yaml
# .github/workflows/test.yml
- name: Run tests with retry
  run: |
    mvn test || mvn test || mvn test
    # Pass if any run succeeds → flaky indicator
```

*3. Test reports analysis:*
```bash
# Check surefire reports
grep -r "Flake" target/surefire-reports/
grep -r "Unstable" target/surefire-reports/
```

*4. Quarantine pattern:*
```java
@Tag("flaky")
@Test
void flakyTest() { }

// Run stable tests only
mvn test -Dgroups="!flaky"

// Run flaky tests separately để monitor
mvn test -Dgroups="flaky"
```

**Em's strategy trong project:**

```java
// 1. Use @Transactional
@SpringBootTest
@Transactional  // ✅ Isolation
class IntegrationTest { }

// 2. Fixed test data
@BeforeEach
void setUp() {
    testUser.setUsername("Hyan2005");  // ✅ Deterministic
    // Không random data
}

// 3. Avoid timing dependencies
// Em KHÔNG test JWT expiration trực tiếp
// Chỉ test validateToken() với valid/invalid tokens

// 4. Sequential execution (default)
// JUnit không run parallel → no race conditions
```

**Nếu phát hiện flaky test:**
1. **Isolate**: Reproduce locally
2. **Debug**: Add logging
3. **Fix**: Remove timing dependency
4. **Verify**: Run 100 lần
5. **Document**: Add comment về fix

---

### **26. Test Pyramid**

**Tỷ lệ tests trong project em:**

Dạ, em đếm tests hiện tại:

```
Unit Tests (Fake/Mock):
- AuthServiceTest: ~6 tests
- ProductServiceTest: ~8 tests  
- AuthControllerTest (Mock): ~5 tests
- ProductServiceTest (Mock): ~7 tests
Total: ~26 unit tests

Integration Tests:
- AuthControllerTest (Integration): ~5 tests
- ProductControllerTest (Integration): ~7 tests
Total: ~12 integration tests

E2E Tests (Cypress):
- Login flow: ~3 tests
- Product CRUD: ~4 tests
Total: ~7 e2e tests
```

**Tỷ lệ:**
- Unit: 26 tests (~58%)
- Integration: 12 tests (~27%)
- E2E: 7 tests (~15%)

**Ratio: 58:27:15** ≈ **60:30:10** ✅

**Em có follow test pyramid không:**

**CÓ** ạ thầy, em cố gắng follow pyramid:

```
         /\
        /E2\      ← 7 tests (15%) - Manual + Automated
       /E2E \       Cypress tests, User flows
      /------\
     /        \
    /Integration\ ← 12 tests (27%) - API integration
   / Integration \  SpringBootTest, Full stack
  /--------------\
 /                \
/   Unit Tests     \ ← 26 tests (58%) - Majority
\__________________/   Fast, Isolated, Many scenarios
```

**Breakdown chi tiết:**

*Unit Tests (58% - ✅ Most):*
```java
// Service layer logic - FAKE dependencies
- AuthServiceTest: business logic với fake repo
- ProductServiceTest: CRUD logic với fake repo

// Controller layer - MOCK dependencies  
- AuthControllerTest (Mock): HTTP handling với mock service
- ProductServiceTest (Mock): Interaction testing
```

**Characteristics:**
- ⚡ Fast: <100ms each
- 🔒 Isolated: No database, no network
- 🎯 Focused: One method, one scenario
- 🔢 Many: Cover nhiều edge cases

*Integration Tests (27% - ✅ Middle):*
```java
// Full stack với real dependencies
- AuthControllerTest (Integration): Request → Controller → Service → Database
- ProductControllerTest (Integration): CRUD với real database
```

**Characteristics:**
- 🐌 Slower: ~500ms each
- 🔗 Connected: Real Spring context, H2 database
- 🎭 Realistic: Test component interactions
- 📊 Fewer: Cover happy paths + critical errors

*E2E Tests (15% - ✅ Least):*
```javascript
// Cypress - Browser automation
- login.cy.ts: User login flow
- product.cy.ts: Create, Read, Update, Delete products
```

**Characteristics:**
- 🐢 Slowest: ~2-5s each
- 🌐 Full system: Frontend + Backend + Database
- 👤 User perspective: Real user interactions
- 🎪 Very few: Cover critical user journeys only

**Tại sao nhiều unit test hơn integration:**

*1. Speed - Fast feedback:*
```
Unit test suite: 26 tests × 100ms = 2.6 seconds
Integration test suite: 12 tests × 500ms = 6 seconds  
E2E test suite: 7 tests × 3s = 21 seconds

Total: ~30 seconds (acceptable)

Nếu 100% integration:
45 tests × 500ms = 22.5 seconds (chậm)

Nếu 100% E2E:
45 tests × 3s = 135 seconds (quá chậm!)
```

Em chạy tests mỗi commit → cần feedback nhanh!

*2. Cost - Maintenance & Resources:*
```
Unit tests:
- ✅ No infrastructure needed
- ✅ Run anywhere (laptop, CI/CD)
- ✅ No flakiness
- ✅ Easy to debug

Integration tests:
- ⚠️ Need database (H2 in-memory)
- ⚠️ More setup code
- ⚠️ Slower CI/CD

E2E tests:
- ❌ Need full stack running
- ❌ Need browser (headless Chrome)
- ❌ Flaky (network, timing)
- ❌ Hard to debug (screenshot, videos)
```

*3. Coverage - Combinatorial explosion:*
```java
// 1 method with 5 parameters, each có 3 values
// → 3^5 = 243 combinations!

// Unit test: Test mỗi parameter independently
testWithParam1Invalid()  // 5 tests
testWithParam2Invalid()
...

// Integration test: Test happy path + critical errors
testCreateSuccess()  // 2-3 tests
testCreateFailValidation()

// E2E test: Test typical user flow
testUserCreatesProduct()  // 1 test
```

Unit tests cover nhiều scenarios với ít cost hơn.

*4. Isolation - Debug dễ hơn:*
```
Unit test fail:
→ Biết chính xác method/logic nào sai
→ Fix ngay trong service layer

Integration test fail:  
→ Bug ở đâu? Controller? Service? Repository? Database?
→ Phải debug nhiều layers

E2E test fail:
→ Bug ở đâu? Frontend? Backend? Network? Browser?
→ Rất khó pinpoint
```

*5. Confidence - Pyramid stability:*
```
Wide base (Unit):
- Many tests catch regressions
- Fast execution
- Stable foundation

Narrow middle (Integration):
- Verify components work together
- Catch wiring issues

Thin top (E2E):
- Verify critical user flows
- Catch UI/UX issues
```

**Best practice em follow:**

```java
// ✅ Test business logic với unit tests
@Test
void testUpdateProduct_ChecksDuplicateName() {
    // Fast, focused test
}

// ✅ Test integration với integration tests
@Test
@SpringBootTest
void testCreateProduct_PersistsToDatabase() {
    // Verify full stack
}

// ✅ Test user flows với E2E
it('User can login and create product', () => {
    // Critical happy path
});
```

**Anti-patterns em TRÁNH:**

```java
// ❌ Test business logic với E2E
it('Validates product price must be positive', () => {
    // Too slow for simple validation!
});
// → Nên test bằng unit test

// ❌ Test UI rendering với integration test
@Test
@SpringBootTest
void testLoginButtonIsBlue() {
    // Integration test không test UI!
}
// → Nên test bằng E2E hoặc component test
```

**Kết luận:**

Em's pyramid: **60:30:10** ✅
- Healthy ratio
- Fast feedback (unit tests)
- Confidence (integration tests)
- Reality check (E2E tests)

Nếu thời gian nhiều hơn, em sẽ thêm:
- Nhiều unit tests (boundary cases)
- Contract tests (API contracts)
- Performance tests

Nhưng giữ pyramid shape: **nhiều unit, ít integration, rất ít E2E**! 🏔️