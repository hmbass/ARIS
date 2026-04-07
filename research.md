# ARIS Codebase Research

> **작성일**: 2026-04-06  
> **분석 범위**: 전체 코드베이스 (Backend + Frontend)  
> **목적**: 구현 전 현재 시스템 상태 및 의존성 파악

---

## 1. Architectural Overview

### 시스템 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Compose                          │
│                                                              │
│  ┌──────────────────┐        ┌──────────────────────────┐   │
│  │  React Frontend  │ :3002  │   Spring Boot Backend    │   │
│  │  (Nginx)         │───────▶│   :8082 → :8080          │   │
│  │  Vite + MUI      │        │   /api/**                 │   │
│  └──────────────────┘        └────────────┬─────────────┘   │
│                                           │                  │
│                               ┌───────────▼─────────────┐   │
│                               │  PostgreSQL 15           │   │
│                               │  :5434 → :5432           │   │
│                               │  DB: aris_db             │   │
│                               └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 데이터 흐름 (일반적인 CRUD)

```
Browser
  │
  ├─ [React Component] 사용자 액션 발생
  ├─ [API Module] api.ts Axios 인스턴스 호출
  │    └─ Request Interceptor: Authorization: Bearer {accessToken} 헤더 자동 주입
  │
  HTTP Request → Spring Boot :8080
  │
  ├─ [JwtAuthenticationFilter] 토큰 검증 → SecurityContext에 Authentication 주입
  ├─ [Controller] @RequestMapping 라우팅, @Valid 검증
  ├─ [Service] 비즈니스 로직, @Transactional
  ├─ [Repository] Spring Data JPA 쿼리 실행
  └─ PostgreSQL 결과 반환
  │
  HTTP Response (200/4xx/5xx)
  │
  ├─ [Response Interceptor] 401/403 감지 → /auth/refresh 후 재시도 (max 2회)
  └─ [Component] 상태 업데이트, UI 렌더링
```

### 주요 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| Backend Framework | Spring Boot | 3.2.0 |
| Language (BE) | Java | 17 |
| Database | PostgreSQL | 15+ |
| ORM | Spring Data JPA / Hibernate | - |
| DB Migration | Flyway | - |
| Security | Spring Security + JWT (JJWT) | 0.12.3 |
| API Docs | Springdoc OpenAPI | 3.0 |
| Frontend Framework | React | 19.1.1 |
| Language (FE) | TypeScript | 5.9.3 |
| UI Library | Material-UI (MUI) | 7.3.4 |
| State Management | Zustand | 4.4.7 |
| HTTP Client | Axios | 1.12.2 |
| Routing | React Router DOM | 7.9.4 |
| Form | React Hook Form | 7.65.0 |
| Build (FE) | Vite | 7.1.7 |

---

## 2. File & Component Analysis

### 2-1. 백엔드 패키지 구조

```
backend/src/main/java/com/aris/
├── domain/                         # 비즈니스 도메인 (DDD)
│   ├── auth/                       # 인증 (login, register, refresh, logout)
│   ├── user/                       # 사용자 관리 (CRUD, profile, password)
│   ├── company/                    # 회사 & 부서 관리
│   ├── role/                       # 역할 관리
│   ├── project/                    # 프로젝트 관리 (SI/SM)
│   ├── sr/                         # 서비스 요청 (SR)
│   ├── spec/                       # 명세서 (SPEC, FP/MD)
│   ├── approval/                   # 결재 워크플로우
│   ├── issue/                      # 이슈 트래킹
│   ├── release/                    # 릴리즈 관리
│   ├── incident/                   # 인시던트/장애 관리
│   ├── partner/                    # 파트너/협력사 관리
│   ├── asset/                      # IT 자산 관리
│   ├── dashboard/                  # 대시보드/통계
│   └── menu/                       # 메뉴 권한 관리
└── global/                         # 공유 인프라
    ├── config/                     # WebConfig, SwaggerConfig, JpaConfig
    ├── security/                   # SecurityConfig, JwtTokenProvider,
    │                               #   JwtAuthenticationFilter, CustomUserDetails
    ├── entity/BaseEntity.java      # 공통 감사(Audit) 필드 추상 클래스
    ├── exception/                  # GlobalExceptionHandler, BusinessException,
    │                               #   ErrorCode, ErrorResponse
    └── common/                     # NumberingService (자동채번), FileUploadResponse
```

각 도메인 패키지의 공통 구조:
```
domain/{name}/
├── entity/          # JPA Entity
├── dto/             # Request / Response / CreateRequest / UpdateRequest DTO
├── repository/      # Spring Data JPA Repository
├── service/         # 비즈니스 로직 (@Transactional)
└── controller/      # REST API 엔드포인트 (@RequestMapping)
```

### 2-2. 프론트엔드 구조

```
frontend/src/
├── types/           # TypeScript 타입 정의 (도메인별 9개 파일 + common.types.ts)
├── store/
│   └── authStore.ts # Zustand 전역 인증 상태 (persist → localStorage)
├── api/             # Axios API 모듈 (도메인별 11개 파일)
├── utils/
│   └── api.ts       # Axios 인스턴스 (인터셉터, 토큰 갱신 로직)
├── components/
│   └── layout/
│       ├── MainLayout.tsx
│       ├── Header.tsx
│       └── Sidebar.tsx
└── pages/           # 페이지 컴포넌트 (도메인별 CRUD 4개씩)
    ├── auth/        # LoginPage, RegisterPage, ForgotPasswordPage
    ├── dashboard/   # DashboardPage
    ├── project/     # List / Create / Detail / Edit
    ├── sr/          # List / Create / Detail / Edit
    ├── spec/        # List / Create / Detail / Edit
    ├── approval/    # List / Detail / (Create)
    ├── issue/       # List / Create / Detail / Edit
    ├── incident/    # List / Create / Detail / Edit
    ├── release/     # List / Create / Detail / Edit
    ├── partner/     # List / Create / Detail / Edit
    ├── asset/       # List / Create / Detail / Edit
    └── user/        # List / Create / Detail / Edit / Profile
```

---

## 3. Database Schema

### 전체 22개 테이블

#### Phase 1: Core Foundation

| 테이블 | 역할 | 주요 컬럼 |
|--------|------|-----------|
| `companies` | 조직 정보 | id, name, business_number |
| `departments` | 부서 | id, company_id(FK), name, code |
| `users` | 사용자 계정 | id, email, password, name, company_id, department_id, roles |
| `roles` | 역할 정의 | id, name (ROLE_ADMIN, ROLE_USER…) |
| `user_roles` | 사용자-역할 M:N | user_id, role_id |
| `menus` | 메뉴 항목 | id, name, url, parent_id |
| `menu_permissions` | 메뉴 접근 제어 | menu_id, role_id |

#### Phase 2: Business Operations

| 테이블 | 역할 | 주요 컬럼 |
|--------|------|-----------|
| `projects` | IT 프로젝트 | id, code, name, project_type(SI/SM), status, pm_id, start/end_date |
| `service_requests` | SR | id, sr_number, title, sr_type, sr_category, status, priority, project_id |
| `sr_files` | SR 첨부파일 | id, sr_id(FK), file_name, file_path |
| `specifications` | SPEC 명세서 | id, spec_number, spec_type, status, function_point, man_day, sr_id(FK) |
| `spec_files` | SPEC 첨부파일 | id, spec_id(FK), file_name, file_path |
| `approvals` | 결재 마스터 | id, approval_number, approval_type, target_id, status, current_step |
| `approval_lines` | 결재선 (순차) | id, approval_id(FK), step_order, approver_id, status, comment |

#### Phase 3: Extended Features

| 테이블 | 역할 | 주요 컬럼 |
|--------|------|-----------|
| `issues` | 이슈 트래킹 | id, issue_number, issue_type, priority, status, sr_id, spec_id, project_id |
| `releases` | 릴리즈 | id, release_number, release_type(EMERGENCY/REGULAR), status, scheduled_at |
| `incidents` | 인시던트/장애 | id, title, severity(HIGH/MEDIUM/LOW), system_type, occurred_at |
| `partners` | 파트너사 | id, code, name, business_number, is_closed |
| `assets` | IT 자산 | id, asset_number, asset_type, serial_number, acquired_at, is_expired |

#### 공통 Audit 컬럼 (BaseEntity — 모든 도메인 테이블)

```sql
created_at     TIMESTAMP NOT NULL
created_by     VARCHAR   NOT NULL
updated_at     TIMESTAMP NOT NULL
updated_by     VARCHAR   NOT NULL
deleted_at     TIMESTAMP NULL          -- 소프트 딜리트
version        BIGINT                  -- 낙관적 잠금 (Optimistic Locking)
```

### 주요 관계

```
companies 1─── N departments
companies 1─── N users
departments 1── N users
users N────── M roles (via user_roles)

projects 1──── N service_requests
service_requests 1── 1 specifications
specifications 1──── N approval_lines (via approvals)

approvals 1──── N approval_lines
issues N──FK── sr_id / spec_id / project_id
```

---

## 4. Dependencies & Side Effects

### 4-1. 도메인 간 의존 관계

```
                    ┌──────────┐
                    │ projects │
                    └────┬─────┘
                         │ 1:N
              ┌──────────▼──────────┐
              │  service_requests   │
              └──────────┬──────────┘
                         │ 1:1
              ┌──────────▼──────────┐
              │   specifications    │◄──── issues
              └──────────┬──────────┘
                         │ 1:1
              ┌──────────▼──────────┐
              │      approvals      │
              └──────────┬──────────┘
                         │ 1:N
              ┌──────────▼──────────┐
              │    approval_lines   │
              └─────────────────────┘

releases ─── (독립)
incidents ── (독립, project_id 참조)
partners ─── (독립)
assets ───── (독립, manager_id → users)
```

### 4-2. 공유 상태 (Zustand)

`authStore.ts`가 유일한 전역 상태. 이 스토어가 변경되면 영향받는 범위:

- **모든 페이지**: `MainLayout` → `PrivateRoute` → 인증 체크
- **api.ts 인터셉터**: `accessToken`, `refreshToken` 읽기/쓰기
- **Header.tsx**: 사용자 이름, 역할 표시
- **Sidebar.tsx**: 역할 기반 메뉴 렌더링

```typescript
// authStore.ts 구조
{
  user: User | null,
  accessToken: string | null,
  refreshToken: string | null,
  isAuthenticated: boolean,
  // Actions
  setAuth(), clearAuth(), updateUser()
}
// persist → localStorage key: 'auth-storage'
```

### 4-3. 자동채번 (NumberingService)

모든 엔티티에 적용. 형식: `{PREFIX}{YYYYMM}-{NNNN}`
- SR → `SR202501-0001`
- SPEC → 별도 prefix
- 신규 엔티티 추가 시 반드시 `NumberingService` 확인 필요

### 4-4. 결재 워크플로우 연쇄 효과

SR → SPEC → Approval 흐름에서 상태 전이가 연쇄됨:
1. SR 결재 요청 → `ApprovalService`가 `Approval` + `ApprovalLine` 생성
2. 최종 결재 승인 → SR의 status가 `APPROVED`로 변경
3. SPEC 생성은 SR이 `APPROVED` 상태일 때만 가능

---

## 5. Existing Patterns

### 5-1. 백엔드 핵심 패턴

#### Entity 패턴 (`BaseEntity.java` 상속)
```java
@MappedSuperclass
public abstract class BaseEntity {
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
    private LocalDateTime deletedAt;   // null이면 활성
    @Version private Long version;     // 낙관적 잠금

    public void delete() { this.deletedAt = LocalDateTime.now(); }
    public boolean isDeleted() { return this.deletedAt != null; }
}
```

#### Repository 패턴 (소프트 딜리트 + 페이지네이션)
```java
// 소프트 딜리트된 레코드 제외가 관례
Page<Project> findByDeletedAtIsNull(Pageable pageable);
// 복합 필터
Page<Project> findByDeletedAtIsNullAndStatus(ProjectStatus status, Pageable pageable);
```

#### Service 패턴
```java
@Service
@Transactional(readOnly = true)  // 기본 읽기 전용
@RequiredArgsConstructor
public class ProjectService {
    @Transactional  // 쓰기 작업만 오버라이드
    public ProjectResponse create(ProjectCreateRequest request) { ... }
}
```

#### 예외 처리 패턴
```java
// 사용 예시
throw new BusinessException(ErrorCode.PROJECT_NOT_FOUND);

// ErrorCode enum (code, httpStatus, message)
// GlobalExceptionHandler → 일관된 ErrorResponse 반환
{
  "code": "PROJECT_NOT_FOUND",
  "message": "프로젝트를 찾을 수 없습니다",
  "timestamp": "2026-04-06T10:00:00",
  "errors": []
}
```

#### DTO 분리 패턴
- `{Entity}Response` — 목록 조회용 (경량)
- `{Entity}DetailResponse` — 상세 조회용 (관계 포함)
- `{Entity}CreateRequest` — 생성용
- `{Entity}UpdateRequest` — 수정용

### 5-2. 프론트엔드 핵심 패턴

#### API 모듈 패턴
```typescript
// api/project.ts
export const projectApi = {
  getList: (params: ProjectListParams): Promise<PageResponse<Project>> =>
    apiClient.get('/projects', { params }).then(res => res.data),
  getById: (id: number): Promise<Project> =>
    apiClient.get(`/projects/${id}`).then(res => res.data),
  create: (data: ProjectCreateRequest): Promise<Project> =>
    apiClient.post('/projects', data).then(res => res.data),
  update: (id: number, data: ProjectUpdateRequest): Promise<Project> =>
    apiClient.put(`/projects/${id}`, data).then(res => res.data),
  delete: (id: number): Promise<void> =>
    apiClient.delete(`/projects/${id}`).then(res => res.data),
};
```

#### 페이지 컴포넌트 패턴 (List)
```typescript
// 1. useState로 로컬 상태
const [items, setItems] = useState<Project[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [page, setPage] = useState(0);

// 2. useEffect로 데이터 로딩
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await projectApi.getList({ page, size: 10 });
      setItems(response.content);
    } catch (e) {
      setError('데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [page]);

// 3. isMobile 분기로 테이블/카드 렌더링
const isMobile = useMediaQuery(theme.breakpoints.down('md'));
```

#### Form 패턴 (Create/Edit)
```typescript
const { register, handleSubmit, control, formState: { errors } } = useForm<ProjectCreateRequest>();

const onSubmit = async (data: ProjectCreateRequest) => {
  try {
    await projectApi.create(data);
    navigate('/projects');
  } catch (e) {
    setError('생성 실패');
  }
};
```

#### 다크 테마 색상 팔레트
```typescript
primary:    '#6366f1'  // Indigo
secondary:  '#8b5cf6'  // Purple
background: '#0a0a0f'  // Near Black
surface:    '#1a1a2e'  // Dark surface
text:       '#f8fafc'  // Light
success:    '#10b981'
warning:    '#f59e0b'
error:      '#ef4444'
```

#### 응답형 레이아웃 패턴
- 모바일(`<600px`): 숨겨진 사이드바, 햄버거 메뉴, 카드 레이아웃
- 데스크탑(`>1024px`): 고정 사이드바, 테이블 레이아웃

---

## 6. Potential Risks

### 6-1. 기술적 부채

| 항목 | 내용 | 위험도 |
|------|------|--------|
| **소프트 딜리트 쿼리 누락** | `deletedAt IS NULL` 조건이 모든 쿼리에 명시적으로 있어야 함. 누락 시 삭제된 데이터가 노출될 수 있음 | HIGH |
| **낙관적 잠금 예외 미처리** | `@Version` 컬럼 사용 중이나, 프론트엔드에서 `ObjectOptimisticLockingFailureException` 처리 UX가 불명확 | MEDIUM |
| **토큰 재시도 무한루프 위험** | `api.ts` 인터셉터의 refresh 재시도는 최대 2회로 제한되어 있으나, 새로운 API 모듈 추가 시 동일 패턴 준수 필요 | MEDIUM |
| **CORS 와일드카드** | 개발 환경 `*` 허용. 프로덕션 배포 전 origin 화이트리스트 제한 필요 | LOW(dev) |
| **파일 업로드 경로** | 로컬 파일시스템 저장. 컨테이너 재시작 시 볼륨 마운트 설정 필수 | MEDIUM |

### 6-2. 구현 시 주의사항

#### 신규 도메인 추가 시 필수 체크리스트
- [ ] `BaseEntity` 상속 여부
- [ ] Flyway 마이그레이션 파일 추가 (`V{x}.{y}.{z}__...`)
- [ ] `NumberingService`에 자동채번 prefix 등록
- [ ] `ErrorCode` enum에 에러 코드 추가
- [ ] 소프트 딜리트 쿼리 조건 (`deletedAt IS NULL`) 확인
- [ ] 프론트엔드 타입 파일 추가 (`types/{domain}.types.ts`)
- [ ] API 모듈 추가 (`api/{domain}.ts`)
- [ ] `App.tsx` 라우트 등록
- [ ] `Sidebar.tsx` 메뉴 항목 추가

#### 기존 도메인 수정 시 주의사항
- `SR → SPEC → Approval` 체인의 상태 전이 로직은 `ApprovalService`에 집중되어 있음 — 변경 시 전체 플로우 검증 필요
- `users` 테이블 구조 변경 시 `CustomUserDetails.java`와 `authStore.ts`의 `User` 타입 동기화 필요
- `menus` / `menu_permissions` 테이블 변경 시 `Sidebar.tsx` 렌더링 로직 연동 확인

### 6-3. 환경 변수 의존성

| 변수 | 위치 | 용도 |
|------|------|------|
| `JWT_SECRET` | backend `application.yml` | JWT 서명 키 |
| `SPRING_PROFILES_ACTIVE` | backend | dev/prod 프로파일 전환 |
| `VITE_API_BASE_URL` | frontend `.env.development` | API 기본 URL |

### 6-4. Flyway 마이그레이션 주의사항

- `spring.jpa.hibernate.ddl-auto: validate` → Flyway가 스키마 관리. Entity 변경 시 반드시 마이그레이션 파일 작성 필요
- 현재 `V99.x.x` 파일들은 초기 데이터 삽입 + 스키마 수정용 — 같은 번호대 파일 추가 시 버전 충돌 주의
- `out-of-order: true` 설정 확인 필요 (설정 여부에 따라 낮은 버전 파일 추가 가능 여부 결정)

---

## 7. 미구현 기능 (로드맵)

다음 기능들은 DB/백엔드 준비는 되어 있으나 아직 미구현:

- **통계 / 대시보드 집계** — `dashboard/` 패키지 존재, 내용 미구현
- **Excel 내보내기** — Apache POI 의존성 추가됨, API 미구현
- **배치 처리** — 설계서 언급, 구현 없음
- **알림 시스템** — 설계서 언급, 구현 없음
- **이메일 연동** — 설계서 언급, 구현 없음

---

## 8. 로컬 개발 환경

```bash
# 전체 스택 실행
docker-compose up -d

# 접속 정보
Frontend:   http://localhost:3002
Backend:    http://localhost:8082
Swagger:    http://localhost:8082/swagger-ui.html
PostgreSQL: localhost:5434 (DB: aris_db, User: aris_user)
```

---

## 질문 사항

분석 과정에서 확인이 필요한 사항:

1. **구체적인 구현 대상**: Context 섹션의 작업 내용이 비어 있습니다. 어떤 기능을 구현하거나 수정하려고 하시나요? 대상이 확정되면 해당 도메인에 집중한 상세 분석을 추가하겠습니다.

2. **대시보드 현황**: `dashboard/` 패키지의 구체적인 구현 상태를 확인이 필요합니다. 관련 작업이라면 현재 어느 수준까지 구현되어 있는지 직접 파일을 열어 확인하겠습니다.

3. **테스트 코드 범위**: 백엔드 테스트 파일의 실제 커버리지가 필요하시면 추가로 확인하겠습니다.
