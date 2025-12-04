# ARIS 개발 가이드

## 📋 문서 정보
- **작성일**: 2025-10-15
- **버전**: 1.0.0
- **대상**: Backend 개발자

---

## 🚀 시작하기

### 1. 개발 환경 요구사항

#### 필수 소프트웨어
- **Java**: OpenJDK 17 이상
- **Maven**: 3.9.x 이상
- **Docker**: 20.10.x 이상
- **Docker Compose**: 2.x 이상
- **Git**: 2.x 이상
- **IDE**: IntelliJ IDEA (권장) 또는 Eclipse/VS Code

#### 권장 도구
- **Postman**: API 테스트
- **DBeaver**: 데이터베이스 관리
- **Git GUI**: SourceTree, GitKraken 등

---

### 2. 로컬 환경 설정

#### 2.1 프로젝트 클론
```bash
git clone https://github.com/your-org/ARIS.git
cd ARIS
```

#### 2.2 PostgreSQL 실행 (Docker)
```bash
# PostgreSQL만 실행
docker-compose up -d postgres

# 데이터베이스 접속 확인
docker exec -it aris-postgres psql -U aris_user -d aris_db
```

#### 2.3 Backend 빌드 및 실행

**Maven 사용**
```bash
cd backend

# 의존성 다운로드
./mvnw clean install -DskipTests

# 개발 모드 실행
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# 또는 JAR 실행
java -jar target/aris-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
```

**IntelliJ IDEA**
1. `File` > `Open` > `backend` 폴더 선택
2. Maven 의존성 자동 다운로드 대기
3. `ArisApplication.java` 우클릭 > `Run`
4. `VM Options`에 `-Dspring.profiles.active=dev` 추가

#### 2.4 환경 변수 설정

**application-dev.yml** (로컬 개발용)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/aris_db
    username: aris_user
    password: aris_password
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
  
  flyway:
    enabled: true

jwt:
  secret: your-local-dev-secret-key-at-least-256-bits-long
  access-token-validity: 3600000
  refresh-token-validity: 604800000

logging:
  level:
    com.aris: DEBUG
```

#### 2.5 실행 확인
```bash
# Health Check
curl http://localhost:8080/actuator/health

# Swagger UI
open http://localhost:8080/swagger-ui.html
```

---

## 🏗️ 프로젝트 구조 상세

### 전체 구조
```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/aris/
│   │   │   ├── ArisApplication.java
│   │   │   ├── domain/
│   │   │   │   ├── user/
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   └── User.java
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── UserCreateRequest.java
│   │   │   │   │   │   ├── UserUpdateRequest.java
│   │   │   │   │   │   └── UserResponse.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   └── UserRepository.java
│   │   │   │   │   ├── service/
│   │   │   │   │   │   └── UserService.java
│   │   │   │   │   └── controller/
│   │   │   │   │       └── UserController.java
│   │   │   │   ├── auth/
│   │   │   │   ├── project/
│   │   │   │   ├── sr/
│   │   │   │   └── ...
│   │   │   └── global/
│   │   │       ├── config/
│   │   │       │   ├── JpaConfig.java
│   │   │       │   ├── SwaggerConfig.java
│   │   │       │   └── WebConfig.java
│   │   │       ├── security/
│   │   │       │   ├── SecurityConfig.java
│   │   │       │   ├── JwtTokenProvider.java
│   │   │       │   ├── JwtAuthenticationFilter.java
│   │   │       │   └── CustomUserDetailsService.java
│   │   │       ├── exception/
│   │   │       │   ├── GlobalExceptionHandler.java
│   │   │       │   ├── BusinessException.java
│   │   │       │   ├── ErrorCode.java
│   │   │       │   └── ErrorResponse.java
│   │   │       ├── common/
│   │   │       │   ├── dto/
│   │   │       │   │   ├── PageResponse.java
│   │   │       │   │   └── ApiResponse.java
│   │   │       │   └── util/
│   │   │       │       ├── DateUtils.java
│   │   │       │       └── StringUtils.java
│   │   │       └── entity/
│   │   │           └── BaseEntity.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/
│   │           └── migration/
│   │               ├── V1.0.0__create_companies_table.sql
│   │               ├── V1.0.1__create_departments_table.sql
│   │               └── ...
│   └── test/
│       └── java/com/aris/
│           ├── domain/
│           │   └── user/
│           │       ├── controller/
│           │       │   └── UserControllerTest.java
│           │       ├── service/
│           │       │   └── UserServiceTest.java
│           │       └── repository/
│           │           └── UserRepositoryTest.java
│           └── integration/
│               └── UserIntegrationTest.java
├── pom.xml
├── Dockerfile
└── README.md
```

---

## 💡 개발 가이드

### 1. 새 기능 개발 프로세스

#### Step 1: Entity 설계
```java
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class User extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false, length = 50)
    private String name;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;
    
    @Builder
    public User(String email, String password, String name, Company company) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.company = company;
    }
    
    // Business Methods
    public void changePassword(String newPassword) {
        this.password = newPassword;
    }
}
```

#### Step 2: Flyway Migration 작성
```sql
-- V1.0.3__create_users_table.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    company_id BIGINT REFERENCES companies(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_company ON users(company_id);
```

#### Step 3: Repository 작성
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.company.id = :companyId AND u.deletedAt IS NULL")
    List<User> findActiveUsersByCompany(@Param("companyId") Long companyId);
    
    @Query("SELECT u FROM User u " +
           "WHERE (:name IS NULL OR u.name LIKE %:name%) " +
           "AND (:companyId IS NULL OR u.company.id = :companyId) " +
           "AND u.deletedAt IS NULL")
    Page<User> search(@Param("name") String name, 
                      @Param("companyId") Long companyId, 
                      Pageable pageable);
}
```

#### Step 4: DTO 작성
```java
// Request DTO
@Getter
@NoArgsConstructor
public class UserCreateRequest {
    
    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;
    
    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, max = 20, message = "비밀번호는 8~20자여야 합니다.")
    private String password;
    
    @NotBlank(message = "이름은 필수입니다.")
    private String name;
    
    private Long companyId;
    
    public User toEntity(PasswordEncoder passwordEncoder, Company company) {
        return User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .name(name)
                .company(company)
                .build();
    }
}

// Response DTO
@Getter
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private String companyName;
    private LocalDateTime createdAt;
    
    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .companyName(user.getCompany() != null ? user.getCompany().getName() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
```

#### Step 5: Service 작성
```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        // 중복 검증
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }
        
        // Company 조회
        Company company = null;
        if (request.getCompanyId() != null) {
            company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.COMPANY_NOT_FOUND));
        }
        
        // Entity 생성 및 저장
        User user = request.toEntity(passwordEncoder, company);
        User savedUser = userRepository.save(user);
        
        return UserResponse.from(savedUser);
    }
    
    public UserResponse getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return UserResponse.from(user);
    }
    
    public Page<UserResponse> searchUsers(String name, Long companyId, Pageable pageable) {
        Page<User> users = userRepository.search(name, companyId, pageable);
        return users.map(UserResponse::from);
    }
    
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        
        user.updateInfo(request.getName(), request.getPhoneNumber());
        
        return UserResponse.from(user);
    }
    
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        user.delete(); // Soft Delete
    }
}
```

#### Step 6: Controller 작성
```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "사용자 관리 API")
public class UserController {
    
    private final UserService userService;
    
    @PostMapping
    @Operation(summary = "사용자 등록", description = "새로운 사용자를 등록합니다.")
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody UserCreateRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "사용자 조회", description = "사용자 상세 정보를 조회합니다.")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        UserResponse response = userService.getUser(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "사용자 목록 조회", description = "사용자 목록을 페이징하여 조회합니다.")
    public ResponseEntity<Page<UserResponse>> searchUsers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long companyId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<UserResponse> response = userService.searchUsers(name, companyId, pageable);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "사용자 수정", description = "사용자 정보를 수정합니다.")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "사용자 삭제", description = "사용자를 삭제합니다.")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
```

#### Step 7: 테스트 작성
```java
// Repository Test
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class UserRepositoryTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    @DisplayName("이메일로 사용자를 조회할 수 있다")
    void findByEmail() {
        // given
        User user = User.builder()
                .email("test@example.com")
                .password("password")
                .name("Test User")
                .build();
        userRepository.save(user);
        
        // when
        Optional<User> found = userRepository.findByEmail("test@example.com");
        
        // then
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
    }
}

// Service Test
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private CompanyRepository companyRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @InjectMocks
    private UserService userService;
    
    @Test
    @DisplayName("사용자를 생성할 수 있다")
    void createUser() {
        // given
        UserCreateRequest request = new UserCreateRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");
        request.setName("Test User");
        
        given(userRepository.existsByEmail(anyString())).willReturn(false);
        given(passwordEncoder.encode(anyString())).willReturn("encodedPassword");
        given(userRepository.save(any(User.class))).willReturn(user);
        
        // when
        UserResponse response = userService.createUser(request);
        
        // then
        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        verify(userRepository).save(any(User.class));
    }
}

// Controller Test
@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Test
    @DisplayName("사용자 생성 API를 호출할 수 있다")
    void createUser() throws Exception {
        // given
        UserCreateRequest request = new UserCreateRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");
        request.setName("Test User");
        
        UserResponse response = UserResponse.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .build();
        
        given(userService.createUser(any(UserCreateRequest.class))).willReturn(response);
        
        // when & then
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }
}
```

---

### 2. 공통 패턴 및 유틸리티

#### BaseEntity
```java
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @CreatedBy
    @Column(nullable = false, updatable = false, length = 50)
    private String createdBy;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @LastModifiedBy
    @Column(nullable = false, length = 50)
    private String updatedBy;
    
    @Column
    private LocalDateTime deletedAt;
    
    @Version
    private Long version;
    
    public void delete() {
        this.deletedAt = LocalDateTime.now();
    }
    
    public boolean isDeleted() {
        return deletedAt != null;
    }
}
```

#### PageResponse (공통 페이징 응답)
```java
@Getter
@Builder
public class PageResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
    
    public static <T> PageResponse<T> of(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}
```

#### ApiResponse (공통 API 응답)
```java
@Getter
@Builder
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }
    
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .build();
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
}
```

---

### 3. 트러블슈팅 가이드

#### 문제: N+1 쿼리 발생
```java
// ❌ 잘못된 예
@GetMapping
public List<UserResponse> getUsers() {
    List<User> users = userRepository.findAll();
    // 각 User마다 Company 조회 쿼리 발생 (N+1)
    return users.stream()
            .map(UserResponse::from)
            .collect(Collectors.toList());
}

// ✅ 해결 방법 1: @EntityGraph
@EntityGraph(attributePaths = {"company"})
List<User> findAll();

// ✅ 해결 방법 2: JOIN FETCH
@Query("SELECT u FROM User u LEFT JOIN FETCH u.company")
List<User> findAllWithCompany();
```

#### 문제: LazyInitializationException
```java
// ❌ 잘못된 예 (Service에서 @Transactional 누락)
public UserResponse getUser(Long id) {
    User user = userRepository.findById(id).orElseThrow();
    // company는 Lazy Loading이므로 예외 발생
    return UserResponse.from(user);
}

// ✅ 해결 방법
@Transactional(readOnly = true)
public UserResponse getUser(Long id) {
    User user = userRepository.findById(id).orElseThrow();
    return UserResponse.from(user);
}
```

#### 문제: Flyway Migration 실패
```bash
# 마이그레이션 상태 확인
docker exec aris-postgres psql -U aris_user -d aris_db -c "SELECT * FROM flyway_schema_history;"

# 마이그레이션 재시작 (주의!)
# 1. 잘못된 마이그레이션 파일 수정
# 2. DB 초기화 후 재시작
docker-compose down -v
docker-compose up -d postgres
./mvnw spring-boot:run
```

---

### 4. 성능 최적화 팁

#### Batch Insert
```java
@Transactional
public void createUsersInBatch(List<UserCreateRequest> requests) {
    List<User> users = requests.stream()
            .map(req -> req.toEntity(passwordEncoder, null))
            .collect(Collectors.toList());
    
    // Batch Insert (hibernate.jdbc.batch_size 설정 필요)
    userRepository.saveAll(users);
}
```

#### Query Hint
```java
@QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
@Query("SELECT u FROM User u WHERE u.deletedAt IS NULL")
List<User> findAllReadOnly();
```

#### 동적 쿼리 (QueryDSL 권장)
```java
public Page<User> searchDynamic(UserSearchCondition condition, Pageable pageable) {
    BooleanBuilder builder = new BooleanBuilder();
    
    if (StringUtils.hasText(condition.getName())) {
        builder.and(user.name.contains(condition.getName()));
    }
    
    if (condition.getCompanyId() != null) {
        builder.and(user.company.id.eq(condition.getCompanyId()));
    }
    
    builder.and(user.deletedAt.isNull());
    
    return userRepository.findAll(builder, pageable);
}
```

---

## 🧪 테스트 전략

### 1. 단위 테스트 (Unit Test)
- **대상**: Service Layer
- **도구**: JUnit 5 + Mockito
- **목표**: 비즈니스 로직 검증

### 2. 통합 테스트 (Integration Test)
- **대상**: Repository Layer + Database
- **도구**: @DataJpaTest + TestContainers
- **목표**: 데이터 접근 로직 검증

### 3. API 테스트 (Controller Test)
- **대상**: Controller Layer
- **도구**: @WebMvcTest + MockMvc
- **목표**: API 엔드포인트 검증

### 4. 테스트 커버리지
- **최소 목표**: 80%
- **확인 방법**:
```bash
./mvnw clean test jacoco:report
open target/site/jacoco/index.html
```

---

## 🔧 유용한 명령어

### Maven
```bash
# 빌드 (테스트 포함)
./mvnw clean package

# 빌드 (테스트 제외)
./mvnw clean package -DskipTests

# 테스트 실행
./mvnw test

# 특정 테스트 실행
./mvnw test -Dtest=UserServiceTest

# 의존성 업데이트 확인
./mvnw versions:display-dependency-updates
```

### Docker
```bash
# 전체 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f backend

# 컨테이너 재시작
docker-compose restart backend

# 전체 종료 및 볼륨 삭제
docker-compose down -v

# PostgreSQL 접속
docker exec -it aris-postgres psql -U aris_user -d aris_db
```

### PostgreSQL
```sql
-- 테이블 목록
\dt

-- 테이블 구조
\d users

-- 데이터 확인
SELECT * FROM users WHERE deleted_at IS NULL;

-- 인덱스 확인
\di

-- Flyway 마이그레이션 이력
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

---

## 📚 추가 학습 자료

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Data JPA Reference](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [Effective Java (Joshua Bloch)](https://www.oreilly.com/library/view/effective-java/9780134686097/)
- [Clean Code (Robert C. Martin)](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)

---

**Last Updated**: 2025-10-15
**Document Version**: 1.0.0









