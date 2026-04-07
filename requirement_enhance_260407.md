# ARIS 시스템 개선사항 분석 보고서

> **문서 버전**: 1.0  
> **분석일**: 2026-04-07  
> **분석 대상**: 전체 소스코드 + requirement_Improve_260406.md 교차 분석  
> **분석 범위**: 보안 / 성능 / UX / 아키텍처 / 기능 완결성 / 설정 및 배포

---

## 개요

본 문서는 기존 개선 요구사항(`requirement_Improve_260406.md`)에서 다루지 않은 항목을 대상으로, 소스코드 심층 분석을 통해 발견된 **추가 개선사항**을 정리한 것입니다. 심각도 기준(CRITICAL / HIGH / MEDIUM / LOW)으로 분류하며, 각 항목마다 근거 파일과 구체적인 조치 방향을 명시합니다.

---

## 전체 요약

| 심각도 | 건수 | 주요 영역 |
|--------|------|-----------|
| CRITICAL | 4 | 보안 (JWT 저장, 임시 비밀번호 노출, JWT 시크릿) / 테스트 부재 |
| HIGH | 5 | 보안 (CORS), 성능 (N+1, 인덱스), 기능 (감사 로그, 소프트 딜리트 누락) |
| MEDIUM | 18 | 보안, UX, 아키텍처, 설정, 기능 완결성 |
| LOW | 10 | UX, 성능, 코드 품질 |
| **합계** | **37** | |

---

## 1. 보안 (Security)

### ENH-SEC-001 · JWT 토큰 localStorage 저장 — XSS 취약점

| 항목 | 내용 |
|------|------|
| **심각도** | CRITICAL |
| **영향 파일** | `frontend/src/utils/api.ts`, `frontend/src/store/authStore.ts` |

**문제**  
Access Token과 Refresh Token 모두 `localStorage`에 저장. JavaScript로 직접 접근 가능하여 XSS 공격 발생 시 토큰 탈취 가능.

```typescript
// api.ts 현재 코드 — 취약
const token = localStorage.getItem('accessToken');
config.headers.Authorization = `Bearer ${token}`;
```

**조치 방향**  
- Access Token: 메모리(Zustand in-memory)에만 저장 + 앱 시작 시 `/auth/refresh`로 복구  
- Refresh Token: `httpOnly; Secure; SameSite=Strict` 쿠키로 서버가 Set-Cookie  
- 백엔드 `AuthController`에서 쿠키 발급 처리 추가  
- 프론트엔드 `api.ts` 인터셉터에서 localStorage 제거

---

### ENH-SEC-002 · 임시 비밀번호 HTTP 응답에 노출

| 항목 | 내용 |
|------|------|
| **심각도** | CRITICAL |
| **영향 파일** | `backend/src/main/java/com/aris/domain/auth/controller/AuthController.java` |

**문제**  
`forgot-password` 엔드포인트가 임시 비밀번호를 HTTP 응답 본문에 직접 반환. 브라우저 히스토리, 네트워크 로그, 서버 로그에 평문 노출.

**조치 방향**  
- 응답에서 임시 비밀번호 완전 제거  
- 이메일 발송 서비스(REQ-034) 구현 후 이메일로만 전달  
- 단기 방안: 응답에 "임시 비밀번호를 등록된 이메일로 발송했습니다" 메시지만 반환  
- 중기 방안: 비밀번호 재설정 토큰(1회용, 30분 만료) 방식으로 전환

---

### ENH-SEC-003 · JWT 시크릿 기본값 하드코딩

| 항목 | 내용 |
|------|------|
| **심각도** | CRITICAL |
| **영향 파일** | `backend/src/main/resources/application.yml` |

**문제**  
```yaml
jwt:
  secret: ${JWT_SECRET:aris-jwt-secret-key-must-be-at-least-256-bits-for-hs256-algorithm}
```
환경 변수 미설정 시 하드코딩된 값이 실제 사용됨. 코드/이미지가 유출될 경우 모든 토큰 위조 가능.

**조치 방향**  
- 기본값 완전 제거: `jwt.secret: ${JWT_SECRET}` (미설정 시 앱 기동 실패)  
- 최소 512bit(64바이트) 이상의 랜덤 시크릿 사용  
- `@PostConstruct`로 시크릿 강도 검증 추가

---

### ENH-SEC-004 · CORS 설정 과도하게 허용

| 항목 | 내용 |
|------|------|
| **심각도** | HIGH |
| **영향 파일** | `backend/src/main/java/com/aris/global/security/SecurityConfig.java` |

**문제**  
```java
configuration.setAllowedOriginPatterns(List.of("*"));
configuration.setAllowCredentials(true);
```
`allowedOriginPatterns("*")`와 `allowCredentials(true)` 동시 사용은 보안상 모순. 모든 도메인에서 인증 포함 요청 허용.

**조치 방향**  
```java
// 환경별 허용 Origin 분리
configuration.setAllowedOrigins(List.of(
    "http://localhost:3000",
    "http://localhost:3002",
    "${FRONTEND_URL}"  // 프로덕션 도메인
));
configuration.setAllowCredentials(true);
```

---

### ENH-SEC-005 · 비밀번호 복잡도 정책 미흡

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | `backend/src/main/java/com/aris/domain/user/dto/UserCreateRequest.java` |

**문제**  
`@Size(min=8, max=20)` 길이만 검사. 영문/숫자/특수문자 조합 강제 없음.

**조치 방향**  
```java
@Pattern(
  regexp = "^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{10,}$",
  message = "비밀번호는 영문, 숫자, 특수문자(@$!%*?&)를 포함한 10자 이상이어야 합니다."
)
private String password;
```

---

### ENH-SEC-006 · 텍스트 입력 필드 XSS 방지 미구현

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | SR, SPEC, 이슈, 장애 등 텍스트 입력 DTO 전체 |

**문제**  
`businessRequirement`, `content`, `description` 등 대용량 텍스트 필드에 길이 제한(`@Size`) 및 HTML 이스케이핑 없음. Stored XSS 가능성.

**조치 방향**  
- 백엔드 DTO에 `@Size(max = 5000)` 추가  
- `Jsoup.clean(input, Safelist.none())` 또는 Spring의 `HtmlUtils.htmlEscape()` 적용  
- 프론트엔드 렌더링 시 `dangerouslySetInnerHTML` 미사용 확인

---

### ENH-SEC-007 · 로그인 시도 횟수 제한 (Rate Limiting) 미구현

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | `backend/src/main/java/com/aris/domain/auth/service/AuthService.java` |

**문제**  
계정 잠금(5회) 로직이 미구현 상태임과 동시에, IP 기반 요청 횟수 제한도 없음. 분산 브루트포스 공격에 무방비.

**조치 방향**  
- Spring Boot + Bucket4j 라이브러리로 Rate Limiting 추가  
- 동일 IP에서 `/api/auth/login` 5분 내 10회 이상 → 429 Too Many Requests  
- 또는 Spring Security의 `DefaultAuthenticationEventPublisher` 활용

---

### ENH-SEC-008 · Swagger UI 프로덕션 노출

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | `backend/src/main/resources/application.yml` |

**문제**  
`/swagger-ui.html`, `/v3/api-docs`가 `permitAll()`로 등록되어 프로덕션에서도 API 전체 구조 노출.

**조치 방향**  
```yaml
springdoc:
  swagger-ui:
    enabled: ${SWAGGER_ENABLED:false}   # 기본 비활성
  api-docs:
    enabled: ${SWAGGER_ENABLED:false}
```

---

## 2. 성능 (Performance)

### ENH-PERF-001 · N+1 쿼리 문제

| 항목 | 내용 |
|------|------|
| **심각도** | HIGH |
| **영향 파일** | 서비스/레포지토리 전반 |

**문제**  
`User → roles`, `User → company`, `ServiceRequest → project`, `Approval → approvalLines → approver` 등 다수의 `FetchType.LAZY` 관계가 목록 조회 시 N+1 쿼리 유발.

예: 사용자 100명 목록 조회 → 사용자 쿼리 1회 + 역할 조회 100회 = **101회 쿼리**

**조치 방향**  
```java
// 방법 1: @EntityGraph
@EntityGraph(attributePaths = {"roles", "company", "department"})
Page<User> findByDeletedAtIsNull(Pageable pageable);

// 방법 2: JPQL JOIN FETCH
@Query("SELECT u FROM User u LEFT JOIN FETCH u.roles LEFT JOIN FETCH u.company WHERE u.deletedAt IS NULL")
```
- 목록 전용 경량 Projection DTO 분리 (상세 조회용과 분리)

---

### ENH-PERF-002 · 누락된 DB 인덱스

| 항목 | 내용 |
|------|------|
| **심각도** | HIGH |
| **영향 파일** | `backend/src/main/resources/db/migration/` 전체 |

**문제**  
자주 조회되는 컬럼에 인덱스 미생성:

| 테이블 | 누락 인덱스 컬럼 |
|--------|-----------------|
| `approvals` | `approval_type`, `status`, `(approval_type, status)` 복합 |
| `projects` | `status`, `project_type` |
| `users` | `is_active`, `is_approved` |
| `service_requests` | `priority`, `(sr_type, status)` 복합 |
| `issues` | `issue_type`, `priority` |
| `incidents` | `severity`, `status` |

**조치 방향**  
신규 Flyway 마이그레이션 파일 생성:
```sql
-- V3.0.6__add_performance_indexes.sql
CREATE INDEX idx_approvals_type_status ON approvals(approval_type, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_status_type ON projects(status, project_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(is_active, is_approved) WHERE deleted_at IS NULL;
```

---

### ENH-PERF-003 · 목록 조회 시 대용량 텍스트 필드 과다 조회

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | SR, SPEC, 이슈 등 목록 API |

**문제**  
목록 API가 상세 조회용 필드(`businessRequirement`, `content` 등 TEXT 타입)까지 함께 반환. 불필요한 네트워크 트래픽 발생.

**조치 방향**  
목록용 경량 DTO 분리:
```java
// 목록용 (현재 없음)
public record SrListResponse(Long id, String srNumber, String title, SrStatus status, Priority priority, ...) {}

// 상세용 (기존)
public record SrDetailResponse(Long id, ..., String businessRequirement, List<SrFileResponse> files) {}
```

---

### ENH-PERF-004 · 페이지 크기 상한선 미설정

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | 모든 Controller (`@PageableDefault`) |

**문제**  
클라이언트가 `?size=10000` 요청 시 무제한 데이터 반환 가능. OOM 및 DoS 위험.

**조치 방향**  
```java
// Controller에서 page size 검증
@GetMapping
public Page<SrResponse> getList(@PageableDefault(size = 20) Pageable pageable) {
    Pageable validated = PageRequest.of(
        pageable.getPageNumber(),
        Math.min(pageable.getPageSize(), 100),  // 최대 100건
        pageable.getSort()
    );
    return srService.getList(validated);
}
```

---

### ENH-PERF-005 · 대시보드 다중 API 호출 미최적화

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | `frontend/src/pages/dashboard/DashboardPage.tsx` |

**문제**  
대시보드 진입 시 최소 3개의 개별 API 호출. 각각 독립 로딩 상태로 화면 깜빡임 발생.

**조치 방향**  
- 백엔드: `GET /api/dashboard/summary` 단일 집계 엔드포인트 신설  
- 응답: `{ projectStats, srStats, approvalStats, issueStats, recentActivities }`  
- `Cache-Control: max-age=300`으로 5분 캐싱  
- 프론트엔드: `Promise.all([...])` 병렬 호출 또는 단일 API 사용

---

## 3. UX/UI

### ENH-UX-001 · 삭제 작업 확인 다이얼로그 미구현

| 항목 | 내용 |
|------|------|
| **심각도** | HIGH |
| **영향 파일** | 모든 Detail 페이지 (삭제 버튼 존재 화면) |

**문제**  
삭제 버튼 클릭 즉시 API 호출. 잘못 클릭 시 데이터 복구 불가(소프트 딜리트이지만 사용자 관점에서는 삭제).

**조치 방향**  
```tsx
// 공통 확인 다이얼로그 컴포넌트 생성
<ConfirmDialog
  open={deleteConfirmOpen}
  title="삭제 확인"
  message={`'${item.title}'을(를) 삭제하시겠습니까?`}
  onConfirm={handleDelete}
  onCancel={() => setDeleteConfirmOpen(false)}
/>
```

---

### ENH-UX-002 · 버튼 로딩 상태 미표시

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | 모든 등록/수정 폼 페이지 |

**문제**  
등록/수정 버튼 클릭 후 API 응답 전까지 버튼이 동일하게 보임. 사용자가 중복 클릭하거나 응답을 기다리는지 알 수 없음.

**조치 방향**  
```tsx
<Button 
  variant="contained" 
  disabled={submitting}
  endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
>
  {submitting ? '저장 중...' : '저장'}
</Button>
```

---

### ENH-UX-003 · 성공 피드백 (Toast/Snackbar) 미표시

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | Create/Edit 페이지 전반 |

**문제**  
등록/수정 성공 후 단순 페이지 이동만 발생. 사용자가 작업 성공 여부를 명확히 인지하기 어려움.

**조치 방향**  
- 전역 Snackbar 컨텍스트 생성 (`useSnackbar` hook)  
- 성공: "SR이 등록되었습니다." (초록, 3초)  
- 실패: "저장 중 오류가 발생했습니다." (빨강, 5초)  
- MUI `Snackbar` + `Alert` 조합

---

### ENH-UX-004 · 빈 상태(Empty State) 안내 미흡

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | 모든 List 페이지 |

**문제**  
데이터 없을 때 단순 "데이터가 없습니다" 텍스트만 표시. 다음 행동(생성 버튼 등) 안내 없음.

**조치 방향**  
```tsx
// 공통 EmptyState 컴포넌트
<EmptyState
  icon={<AssignmentIcon />}
  title="등록된 SR이 없습니다"
  description="새 서비스 요청을 등록하여 시작하세요"
  action={<Button variant="contained" onClick={() => navigate('/srs/new')}>SR 등록</Button>}
/>
```

---

### ENH-UX-005 · 에러 메시지 사용자 비친화적

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | 모든 페이지의 error state 처리 |

**문제**  
백엔드 에러 코드(예: `"C999"`, `"U001"`) 또는 기술적 메시지가 그대로 화면에 노출.

**조치 방향**  
```typescript
// frontend/src/utils/errorMessages.ts (신규)
export const ERROR_MESSAGES: Record<string, string> = {
  'U001': '존재하지 않는 사용자입니다.',
  'P001': '프로젝트를 찾을 수 없습니다.',
  'C999': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  // ...
};
export const getErrorMessage = (code: string) => 
  ERROR_MESSAGES[code] ?? '알 수 없는 오류가 발생했습니다.';
```

---

### ENH-UX-006 · 폼 이탈 방지 (Unsaved Changes Warning) 미구현

| 항목 | 내용 |
|------|------|
| **심각도** | LOW |
| **영향 파일** | 모든 Create/Edit 페이지 |

**문제**  
폼 작성 중 실수로 뒤로 가기 누를 시 모든 입력값 소실.

**조치 방향**  
```tsx
// React Router v7의 useBlocker 활용
const blocker = useBlocker(({ currentLocation, nextLocation }) =>
  isDirty && currentLocation.pathname !== nextLocation.pathname
);
// 변경사항 있을 시 이탈 확인 다이얼로그 표시
```

---

### ENH-UX-007 · 콘솔 로그 프로덕션 노출

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | 프론트엔드 전체 (약 70여 개 `console.log/error` 구문) |

**문제**  
`console.log` 구문이 프로덕션 빌드에서도 실행되어 내부 데이터 구조, 에러 내용 노출.

**조치 방향**  
```typescript
// vite.config.ts 설정 추가
build: {
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
    },
  },
}
// 또는 로깅 라이브러리(loglevel) 도입 후 환경별 레벨 설정
```

---

### ENH-UX-008 · 접근성 (Accessibility) 미고려

| 항목 | 내용 |
|------|------|
| **심각도** | LOW |
| **영향 파일** | 프론트엔드 컴포넌트 전반 |

**문제**  
- 이미지/아이콘 `aria-label` 누락  
- 색상만으로 상태 구분 (색약 사용자 고려 없음)  
- 폼 필드 레이블 연결(`htmlFor`) 누락 가능성

**조치 방향**  
- 아이콘 버튼에 `aria-label` 추가  
- 상태 구분을 색상 + 텍스트/아이콘 병행  
- `axe-core` 또는 `eslint-plugin-jsx-a11y`로 자동 검사

---

## 4. 아키텍처 및 코드 품질

### ENH-ARCH-001 · SecurityContext 추출 로직 중복

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | `ProjectService.java`, `SrService.java`, `ApprovalService.java` 등 |

**문제**  
`getCurrentUser()`, `isAdmin()` 메서드가 3개 이상 서비스에 동일하게 구현됨.

**조치 방향**  
```java
// global/security/SecurityContextService.java (신규)
@Component
@RequiredArgsConstructor
public class SecurityContextService {
    private final UserRepository userRepository;
    
    public User getCurrentUser() {
        CustomUserDetails details = (CustomUserDetails) 
            SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(details.getId())
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
    
    public boolean hasRole(String role) {
        return getCurrentUser().getRoles().stream()
            .anyMatch(r -> r.getName().equals(role));
    }
}
```

---

### ENH-ARCH-002 · 상태 전이 검증 로직 미구현

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | SR, SPEC, 승인, 릴리즈 Service 클래스 |

**문제**  
상태 변경 API가 현재 상태를 검증하지 않아 임의 상태 전이 가능.  
예: `CANCELLED` 상태의 SR을 `APPROVED`로 직접 변경 가능.

**조치 방향**  
상태 전이 유효성 검사 추가:
```java
// SrStatus enum에 허용 전이 정의
public enum SrStatus {
    REQUESTED {
        @Override
        public Set<SrStatus> allowedTransitions() {
            return Set.of(APPROVAL_REQUESTED, CANCELLED);
        }
    },
    APPROVAL_REQUESTED {
        @Override
        public Set<SrStatus> allowedTransitions() {
            return Set.of(APPROVED, REJECTED, CANCELLED);
        }
    },
    // ...
    public abstract Set<SrStatus> allowedTransitions();
    
    public void validateTransition(SrStatus next) {
        if (!allowedTransitions().contains(next)) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION);
        }
    }
}
```

---

### ENH-ARCH-003 · @Transactional(readOnly=true) 누락

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | 모든 Service 클래스의 조회 메서드 |

**문제**  
다수의 read-only 서비스 메서드에 `@Transactional(readOnly=true)` 미적용.  
읽기 전용 설정 시 Hibernate의 dirty checking 비활성화 → 성능 향상.

**조치 방향**  
클래스 레벨에 `@Transactional(readOnly = true)` 기본 설정, 쓰기 메서드에만 `@Transactional` 오버라이드:
```java
@Service
@Transactional(readOnly = true)  // 클래스 기본: 읽기 전용
@RequiredArgsConstructor
public class SrService {
    @Transactional  // 쓰기 메서드만 오버라이드
    public SrResponse create(SrCreateRequest request) { ... }
    
    // 읽기 메서드는 별도 어노테이션 불필요
    public SrDetailResponse getById(Long id) { ... }
}
```

---

### ENH-ARCH-004 · 전역 예외 처리기 누락 예외 타입

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | `backend/src/main/java/com/aris/global/exception/GlobalExceptionHandler.java` |

**문제**  
현재 처리 중인 예외: `BusinessException`, `MethodArgumentNotValidException`, `AuthenticationException`, `AccessDeniedException`, `Exception`  
누락된 예외 타입:

| 예외 | 발생 상황 | 현재 처리 |
|------|-----------|----------|
| `DataIntegrityViolationException` | DB 유니크 제약 위반 | 500으로 처리됨 |
| `ObjectOptimisticLockingFailureException` | 낙관적 잠금 충돌 | 500으로 처리됨 |
| `IllegalArgumentException` | 잘못된 파라미터 | 500으로 처리됨 |
| `NoResourceFoundException` | 없는 URL 요청 | 처리 방식 확인 필요 |
| `MaxUploadSizeExceededException` | 파일 크기 초과 | 500으로 처리됨 |

**조치 방향**  
```java
@ExceptionHandler(DataIntegrityViolationException.class)
public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException e) {
    // 유니크 제약 위반 → 409 Conflict
    return ResponseEntity.status(CONFLICT).body(ErrorResponse.of(ErrorCode.DUPLICATE_RESOURCE));
}

@ExceptionHandler(ObjectOptimisticLockingFailureException.class)
public ResponseEntity<ErrorResponse> handleOptimisticLock(ObjectOptimisticLockingFailureException e) {
    // 낙관적 잠금 충돌 → 409 Conflict + 재시도 안내
    return ResponseEntity.status(CONFLICT).body(ErrorResponse.of(ErrorCode.CONCURRENT_MODIFICATION));
}
```

---

### ENH-ARCH-005 · API 버전 관리 미흡

| 항목 | 내용 |
|------|------|
| **심각도** | LOW |
| **영향 파일** | 모든 Controller |

**문제**  
현재 경로: `/api/projects`, `/api/srs` 등 버전 없음.  
향후 API 변경 시 하위 호환성 보장 불가.

**조치 방향**  
- 단기: 현행 유지 (내부 시스템이므로 파괴적 변경 통제 가능)  
- 중기: URI 버전 관리 도입 (`/api/v1/projects`)  
- 또는 헤더 버전 관리 (`Accept: application/vnd.aris.v1+json`)

---

### ENH-ARCH-006 · 매직 넘버/문자열 상수화 미흡

| 항목 | 내용 |
|------|------|
| **심각도** | LOW |
| **영향 파일** | 서비스 클래스, 프론트엔드 페이지 |

**문제**  
- `size=100` 드롭다운 최대 건수 하드코딩  
- 배지 갱신 주기 `30000ms` 하드코딩 (Sidebar.tsx)  
- 로그인 실패 잠금 기준 `5회` 하드코딩  
- 파일 크기 제한 `100MB` 하드코딩

**조치 방향**  
```java
// SystemConstants.java
public final class SystemConstants {
    public static final int MAX_LOGIN_FAILURES = 5;
    public static final int MAX_PAGE_SIZE = 100;
    public static final int DROPDOWN_PAGE_SIZE = 100;
}
```

---

## 5. 기능 완결성

### ENH-FEAT-001 · 감사 로그 (Audit Log) 미구현

| 항목 | 내용 |
|------|------|
| **심각도** | HIGH |
| **영향 파일** | 시스템 전반 (신규 기능) |

**문제**  
누가 언제 어떤 데이터를 변경했는지 추적 불가. 규정 준수(Compliance) 및 장애 원인 분석 어려움.  
`BaseEntity`의 `createdBy`, `updatedBy`는 최종 변경자만 기록; 이력 조회 불가.

**조치 방향**  
- Spring Data Envers 또는 별도 `audit_logs` 테이블 도입  
- 기록 항목: `entity_type`, `entity_id`, `action(CREATE/UPDATE/DELETE)`, `changed_by`, `changed_at`, `old_values(JSON)`, `new_values(JSON)`  
- 중요 도메인 우선 적용: 사용자, 결재, SR 상태 변경

---

### ENH-FEAT-002 · 소프트 딜리트 필터 누락 위험

| 항목 | 내용 |
|------|------|
| **심각도** | HIGH |
| **영향 파일** | 모든 Repository 클래스 |

**문제**  
`deletedAt IS NULL` 조건이 각 쿼리에 수동으로 명시되어야 함. 신규 쿼리 메서드 추가 시 실수로 누락 가능.

**조치 방향**  
Hibernate의 `@Where` 또는 `@SQLRestriction` 어노테이션을 Entity에 적용:
```java
// BaseEntity 또는 각 Entity에 추가
@SQLRestriction("deleted_at IS NULL")  // Hibernate 6+
@Entity
public class ServiceRequest extends BaseEntity { }
```
이렇게 하면 모든 쿼리에 자동으로 `deleted_at IS NULL` 조건 추가됨.

---

### ENH-FEAT-003 · 알림(Notification) 시스템 미구현

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | `frontend/src/components/layout/Header.tsx` |

**문제**  
현재 알림은 "미결 결재 건수"를 알림으로 대체 사용. 실제 알림 기록이 없어 확인 후 사라지지 않음.

**조치 방향**  
단계별 구현:
1. **단기**: `notifications` 테이블 신설 + REST API (`GET /api/notifications`, `PATCH /api/notifications/{id}/read`)  
2. **중기**: SSE(Server-Sent Events) 또는 WebSocket으로 실시간 푸시  
3. 알림 발생 트리거: 결재 요청, 승인/반려, 이슈 할당, 기한 임박

---

### ENH-FEAT-004 · 파일 첨부/다운로드 기능 미완성

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | SR 파일, SPEC 파일 관련 Entity/Controller |

**문제**  
`sr_files`, `spec_files` 테이블은 존재하나 파일 업로드/다운로드 구현 여부 불명확. Docker 컨테이너 재시작 시 볼륨 마운트 없으면 파일 소실.

**조치 방향**  
- 업로드: `POST /api/srs/{id}/files` (MultipartFile)  
- 다운로드: `GET /api/srs/{id}/files/{fileId}` (토큰 검증 후 스트리밍)  
- 저장 위치: 로컬 파일시스템(개발) → S3 또는 MinIO(운영)  
- 파일 타입 화이트리스트 검증 (MIME type + 확장자)  
- 최대 파일 크기 제한 (현재 100MB → 도메인별 적정 크기 설정)

---

### ENH-FEAT-005 · 데이터 내보내기 (Export) 미구현

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | 목록 페이지 전반 (신규 기능) |

**문제**  
목록 데이터를 Excel/CSV로 내보내는 기능 없음. Apache POI 의존성은 이미 추가되어 있음.

**조치 방향**  
- 백엔드: `GET /api/srs/export?format=xlsx` 엔드포인트 추가  
- `ExcelExportService` 구현 (Apache POI 활용)  
- 프론트엔드: 목록 상단 "엑셀 다운로드" 버튼  
- 대용량 데이터 처리: 비동기 생성 + 다운로드 링크 알림 방식 고려

---

### ENH-FEAT-006 · 대시보드 통계 위젯 부족

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | `frontend/src/pages/dashboard/DashboardPage.tsx` |

**문제**  
현재 대시보드는 기본 카운트만 표시. 의사결정에 필요한 시각화 부족.

**추가 권장 위젯**:

| 위젯 | 내용 |
|------|------|
| SR 상태 분포 | 도넛 차트 (상태별 건수) |
| 월별 SR 등록 추이 | 라인/바 차트 (최근 6개월) |
| 내 결재 대기 목록 | 결재 필요 항목 빠른 접근 |
| 프로젝트별 이슈 현황 | 막대 차트 |
| 기한 초과 SR | 빨간 강조 표시된 목록 |
| 시스템 공지사항 | 공지 게시판 연동 (REQ-032) |

**조치 방향**  
- 차트 라이브러리 도입: `recharts` 또는 `chart.js` (리액트 호환)  
- 백엔드 집계 API: `GET /api/dashboard/summary`

---

### ENH-FEAT-007 · 글로벌 검색 미구현

| 항목 | 내용 |
|------|------|
| **심각도** | LOW |
| **영향 파일** | `frontend/src/components/layout/Header.tsx` |

**문제**  
헤더의 검색 아이콘(⌘K)과 검색 UI가 구현되어 있으나 실제 검색 API가 없어 동작 불가 또는 제한적 동작.

**조치 방향**  
- 백엔드: `GET /api/search?q={keyword}&types=sr,project,issue` 통합 검색 엔드포인트  
- PostgreSQL Full-Text Search 또는 `ILIKE` 기반 기본 검색  
- 결과: 프로젝트, SR, SPEC, 이슈 각 최대 5건씩 카테고리별 표시

---

## 6. 데이터베이스 및 마이그레이션

### ENH-DB-001 · 다형성 외래키 데이터 무결성 취약

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | `backend/src/main/resources/db/migration/V2.0.5__...` (approvals 테이블) |

**문제**  
`approvals.target_id`는 `approval_type`에 따라 SR/SPEC/릴리즈의 ID를 참조하는 다형성 FK. DB 수준에서 참조 무결성 검증 불가.

**조치 방향**  
- 단기: 서비스 레이어에서 target 존재 여부 검증 강화  
- 중기: `approval_type`별 전용 테이블(`sr_approvals`, `spec_approvals`)로 정규화

---

### ENH-DB-002 · 이력 관리 테이블 미구현

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | DB 스키마 전반 |

**문제**  
SR 상태 변경 이력, 결재 의견 변경 이력 등을 조회할 방법 없음.

**조치 방향**  
```sql
-- V4.1.0__create_status_history.sql
CREATE TABLE sr_status_histories (
    id          BIGSERIAL PRIMARY KEY,
    sr_id       BIGINT NOT NULL REFERENCES service_requests(id),
    old_status  VARCHAR(50),
    new_status  VARCHAR(50) NOT NULL,
    changed_by  VARCHAR(255) NOT NULL,
    changed_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    comment     TEXT
);
```

---

### ENH-DB-003 · Flyway 마이그레이션 버전 체계 불일치

| 항목 | 내용 |
|------|------|
| **심각도** | LOW |
| **영향 파일** | `backend/src/main/resources/db/migration/` |

**문제**  
- 기능 버전: V1.x.x ~ V3.x.x  
- 초기 데이터: V99.x.x (큰 간격)  
- 향후 V4.x.x 추가 시 V99.x.x보다 낮은 버전으로 혼재 → `out-of-order` 설정 의존

**조치 방향**  
초기 데이터 마이그레이션 파일을 기능 버전 체계로 이동:
- `V99.0.0` → `R__init_data.sql` (반복 실행 가능한 Repeatable 마이그레이션으로 변경)  
- 또는 `V3.9.0__insert_initial_data.sql` 형식으로 재번호 부여

---

## 7. 설정 및 배포

### ENH-CONF-001 · 개발 DB 자격증명 기본값 노출

| 항목 | 내용 |
|------|------|
| **심각도** | CRITICAL |
| **영향 파일** | `backend/src/main/resources/application-dev.yml` |

**문제**  
개발용 DB 접속 정보(URL, 사용자명, 비밀번호)가 소스 코드에 평문으로 존재. Git에 커밋되어 있을 경우 이력에서 영구 노출.

**조치 방향**  
```yaml
# application-dev.yml 수정
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5434/aris_db}
    username: ${DB_USERNAME}   # 기본값 제거
    password: ${DB_PASSWORD}   # 기본값 제거
```
- `.env` 파일을 `.gitignore`에 추가  
- `.env.example` 파일로 필요한 환경변수 목록 제공

---

### ENH-CONF-002 · 로깅 레벨 운영 환경 부적절

| 항목 | 내용 |
|------|------|
| **심각도** | LOW |
| **영향 파일** | `backend/src/main/resources/application.yml` |

**문제**  
현재 기본 로깅 레벨이 DEBUG (com.aris). 프로덕션 배포 시 내부 로직, 파라미터 값 등 민감 정보가 로그에 기록될 수 있음.

**조치 방향**  
```yaml
# application.yml (기본: INFO)
logging.level:
  root: INFO
  com.aris: INFO

# application-dev.yml (개발: DEBUG)
logging.level:
  com.aris: DEBUG
  org.hibernate.SQL: DEBUG
```

---

### ENH-CONF-003 · 컨테이너 재시작 시 파일 소실 위험

| 항목 | 내용 |
|------|------|
| **심각도** | MEDIUM |
| **영향 파일** | `docker-compose.yml` |

**문제**  
업로드된 파일이 컨테이너 내부에 저장될 경우, 컨테이너 재시작/재생성 시 전체 소실.

**현재 상태**  
docker-compose.yml에 `logs` 볼륨은 마운트되어 있으나 `uploads` 볼륨 설정 확인 필요.

**조치 방향**  
```yaml
# docker-compose.yml
services:
  backend:
    volumes:
      - ./logs:/app/logs
      - uploads_data:/app/uploads   # 명시적 볼륨 마운트

volumes:
  uploads_data:
    driver: local
```

---

## 8. 테스트

### ENH-TEST-001 · 테스트 코드 전무

| 항목 | 내용 |
|------|------|
| **심각도** | CRITICAL |
| **영향 파일** | 전체 프로젝트 |

**문제**  
백엔드, 프론트엔드 모두 테스트 코드가 없음. 기능 추가/변경 시 회귀(Regression) 감지 불가.

**단계별 도입 계획**:

| 단계 | 대상 | 도구 |
|------|------|------|
| 1단계 | 백엔드 서비스 단위 테스트 | JUnit 5 + Mockito |
| 2단계 | 백엔드 Repository 통합 테스트 | TestContainers (PostgreSQL) |
| 3단계 | 인증/결재 워크플로우 E2E 테스트 | RestAssured |
| 4단계 | 프론트엔드 컴포넌트 테스트 | Vitest + Testing Library |

**최우선 테스트 대상**:
- `AuthService` (로그인, 토큰 갱신)  
- `ApprovalService` (결재 워크플로우 상태 전이)  
- `SrService` (SR 생성, 상태 변경)  
- `JwtTokenProvider` (토큰 생성, 검증, 만료)

---

## 우선순위 종합 매트릭스

### CRITICAL — 즉시 조치 필요

| ID | 내용 | 예상 공수 |
|----|------|-----------|
| ENH-SEC-001 | JWT localStorage → 메모리+httpOnly 쿠키 전환 | 2일 |
| ENH-SEC-002 | 임시 비밀번호 응답에서 제거 | 0.5일 |
| ENH-SEC-003 | JWT 시크릿 기본값 제거 | 0.5일 |
| ENH-CONF-001 | DB 자격증명 기본값 제거 | 0.5일 |
| ENH-TEST-001 | 핵심 서비스 단위 테스트 작성 | 5일 |

### HIGH — 단기 내 조치 (1~2주)

| ID | 내용 | 예상 공수 |
|----|------|-----------|
| ENH-SEC-004 | CORS 허용 Origin 화이트리스트 설정 | 0.5일 |
| ENH-PERF-001 | N+1 쿼리 수정 (주요 목록 API) | 3일 |
| ENH-PERF-002 | 누락 DB 인덱스 추가 | 1일 |
| ENH-FEAT-001 | 감사 로그 테이블 및 기록 | 3일 |
| ENH-FEAT-002 | 소프트 딜리트 @SQLRestriction 적용 | 1일 |
| ENH-UX-001 | 삭제 확인 다이얼로그 추가 | 1일 |

### MEDIUM — 중기 개발 (1개월 이내)

| ID | 내용 | 예상 공수 |
|----|------|-----------|
| ENH-SEC-005 | 비밀번호 복잡도 정책 강화 | 0.5일 |
| ENH-SEC-006 | 텍스트 필드 XSS 방지 | 1일 |
| ENH-SEC-007 | Rate Limiting 구현 | 1일 |
| ENH-SEC-008 | Swagger 프로덕션 비활성화 | 0.5일 |
| ENH-ARCH-001 | SecurityContextService 공통화 | 0.5일 |
| ENH-ARCH-002 | 상태 전이 검증 로직 추가 | 2일 |
| ENH-ARCH-003 | @Transactional(readOnly=true) 전면 적용 | 1일 |
| ENH-ARCH-004 | GlobalExceptionHandler 예외 타입 추가 | 1일 |
| ENH-PERF-003 | 목록용 경량 DTO 분리 | 3일 |
| ENH-PERF-004 | 페이지 크기 상한선 설정 | 0.5일 |
| ENH-PERF-005 | 대시보드 집계 API 최적화 | 1일 |
| ENH-UX-002 | 버튼 로딩 상태 표시 | 1일 |
| ENH-UX-003 | 성공/실패 Snackbar 추가 | 1일 |
| ENH-UX-004 | EmptyState 컴포넌트 구현 | 1일 |
| ENH-UX-005 | 에러 메시지 한글화 매핑 | 1일 |
| ENH-UX-007 | console.log 프로덕션 제거 | 0.5일 |
| ENH-FEAT-003 | 알림 시스템 (DB + REST API) | 3일 |
| ENH-FEAT-004 | 파일 업로드/다운로드 구현 | 3일 |
| ENH-FEAT-005 | Excel 내보내기 구현 | 2일 |
| ENH-FEAT-006 | 대시보드 통계 위젯 추가 | 3일 |
| ENH-DB-001 | 다형성 FK 무결성 강화 | 1일 |
| ENH-DB-002 | 이력 관리 테이블 구현 | 2일 |
| ENH-CONF-003 | 파일 업로드 볼륨 마운트 확인 | 0.5일 |

### LOW — 장기 개선

| ID | 내용 |
|----|------|
| ENH-PERF-001 (나머지) | 드롭다운 전용 API 경량화 |
| ENH-ARCH-005 | API 버전 관리 도입 계획 |
| ENH-ARCH-006 | 매직 넘버 상수화 |
| ENH-UX-006 | 폼 이탈 방지 구현 |
| ENH-UX-008 | 접근성(Accessibility) 개선 |
| ENH-DB-003 | Flyway 버전 체계 정리 |
| ENH-CONF-002 | 로깅 레벨 환경별 분리 |
| ENH-FEAT-007 | 글로벌 검색 API 구현 |

---

## requirement_Improve_260406.md 와의 관계

본 문서는 기존 요구사항과 **중복 없이** 추가 발견된 항목만 다룹니다.

| 영역 | requirement_Improve_260406.md | 본 문서 (requirement_enhance_260407.md) |
|------|-------------------------------|-----------------------------------------|
| 검색 조건 | REQ-002~026 (검색 필터 추가) | — |
| 세션 타임아웃 | REQ-031 | ENH-SEC-001 (토큰 저장 방식 변경으로 연계) |
| 공지사항 | REQ-032 | ENH-FEAT-006 (대시보드 위젯으로 연계) |
| 이메일 | REQ-034 | ENH-SEC-002 (임시 비밀번호 이메일 전달로 연계) |
| 보안 | 미다룸 | ENH-SEC-001~008 신규 |
| 성능 | 미다룸 | ENH-PERF-001~005 신규 |
| 감사 로그 | 미다룸 | ENH-FEAT-001 신규 |
| 테스트 | 미다룸 | ENH-TEST-001 신규 |
| 아키텍처 | 미다룸 | ENH-ARCH-001~006 신규 |
