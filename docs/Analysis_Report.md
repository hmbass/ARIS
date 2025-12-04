# ARIS 프로젝트 기능정의서 분석 보고서

## 📋 문서 정보
- **분석일**: 2025-10-15
- **버전**: 1.0.0
- **원본 문서**: 기능정의서_항목별.md
- **분석자**: AI Assistant

---

## 📊 Executive Summary

### 프로젝트 개요
**ARIS (Advanced Request & Issue Management System)**는 IT 프로젝트 관리의 전체 라이프사이클을 지원하는 통합 엔터프라이즈 시스템입니다. SR(Service Request) 요청부터 개발, 승인, 릴리즈, 장애 관리까지 전 과정을 하나의 플랫폼에서 관리할 수 있도록 설계되었습니다.

### 주요 특징
- **총 9개 대분류 모듈**: 시스템, IT, SR, 개발, 승인, 장애, 파트너, 자산, 통계
- **약 100+ 개별 기능**: CRUD 및 비즈니스 프로세스 포함
- **복잡한 승인 워크플로우**: 다단계 승인 프로세스 지원
- **엔터프라이즈급 요구사항**: 권한 관리, 파일 첨부, 배치 처리 등

---

## 🎯 모듈별 상세 분석

### 1.0 시스템 모듈

#### 1.1 권한관리 (Priority: High)
**복잡도**: ★★★★☆ (4/5)

**주요 기능**:
- 권한(Role) CRUD
- 메뉴 권한 관리
- 버튼(기능) 권한 관리
- 사용자 권한 부여/회수
- 권한 승인 프로세스

**기술적 과제**:
- RBAC (Role-Based Access Control) 구현
- 계층적 권한 구조 (메뉴 > 버튼)
- 동적 메뉴 생성 (권한 기반)
- 세밀한 권한 제어 (CRUD 레벨)

**MVP 단계**: Phase 1 (핵심 기반)

**구현 예시**:
```java
// 메서드 레벨 보안
@PreAuthorize("hasRole('ADMIN') or hasPermission(#userId, 'User', 'UPDATE')")
public UserResponse updateUser(Long userId, UserUpdateRequest request) {
    // ...
}

// 메뉴 권한 확인
public List<Menu> getAccessibleMenus(User user) {
    return menuRepository.findByRoles(user.getRoles());
}
```

#### 1.2 로그인 (Priority: Critical)
**복잡도**: ★★★☆☆ (3/5)

**주요 기능**:
- 로그인/로그아웃
- 세션 관리
- 토큰 기반 인증 (JWT)
- 비밀번호 초기화/변경
- 로그인 실패 카운트 및 계정 잠금

**기술적 과제**:
- JWT Access Token + Refresh Token 패턴
- Stateless 인증 구현
- 보안 취약점 방어 (CSRF, XSS, SQL Injection)
- 비밀번호 암호화 (BCrypt)

**MVP 단계**: Phase 1

**구현 예시**:
```java
@PostMapping("/login")
public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
    User user = authService.authenticate(request.getEmail(), request.getPassword());
    String accessToken = jwtTokenProvider.createAccessToken(user);
    String refreshToken = jwtTokenProvider.createRefreshToken(user);
    
    return ResponseEntity.ok(LoginResponse.of(accessToken, refreshToken));
}
```

#### 1.3 인증 관리 (Priority: Critical)
**복잡도**: ★★★☆☆ (3/5)

**주요 기능**:
- 세션 생성 및 검증
- 토큰 유효성 확인
- 토큰 연장 (Refresh)

**MVP 단계**: Phase 1

#### 1.4 알림 관리 (Priority: Medium)
**복잡도**: ★★★☆☆ (3/5)

**주요 기능**:
- SMS 발송 요청
- 알림 내역 조회

**기술적 과제**:
- 외부 SMS API 연동
- 비동기 메시지 발송
- 발송 실패 재시도 로직

**MVP 단계**: Phase 3

#### 1.5 일괄 처리 관리 (Priority: Medium)
**복잡도**: ★★★★☆ (4/5)

**주요 기능**:
- 대량 데이터 파일 생성
- 엑셀 다운로드
- 파일 업로드 및 표준화
- 일괄 등록

**기술적 과제**:
- 대용량 데이터 처리 (메모리 최적화)
- Apache POI (엑셀 처리)
- 백그라운드 작업 (비동기)
- 파일 임시 저장 및 다운로드

**MVP 단계**: Phase 3

#### 1.6 배치관리 (Priority: Medium)
**복잡도**: ★★★★☆ (4/5)

**주요 기능**:
- 배치 Job 정보 관리
- 스케줄 관리 (Cron)
- 배치 실행 이력 조회

**기술적 과제**:
- Spring Batch 또는 Quartz Scheduler
- Job 동적 등록/수정/삭제
- 실행 모니터링 및 로깅

**MVP 단계**: Phase 3

#### 1.7 공통기능 (Priority: High)
**복잡도**: ★★★☆☆ (3/5)

**주요 기능**:
- UI 메인 프레임워크
- 로그인 전/후 화면
- 포탈 (대시보드)
- 공지사항 CRUD
- 사용자 정보 조회/수정

**MVP 단계**: Phase 1, 2

---

### 2.0 IT 관리 모듈

#### 2.1 IT 사업관리 (Priority: High)
**복잡도**: ★★★☆☆ (3/5)

**주요 기능**:
- 프로젝트 CRUD
- 프로젝트 상태 관리 (준비, 진행중, 완료, 취소)
- 프로젝트 기간 관리
- 프로젝트 구분 (SI, SM)

**데이터 모델**:
```sql
projects:
  - code: VARCHAR(20) UNIQUE
  - name: VARCHAR(100)
  - project_type: ENUM('SI', 'SM')
  - status: ENUM('PREPARING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
  - start_date, end_date
  - company_id (FK)
```

**MVP 단계**: Phase 2

---

### 3.0 SR 관리 모듈

#### 3.1.1 개발 SR 관리 (Priority: Critical)
**복잡도**: ★★★★☆ (4/5)

**주요 기능**:
- SR 정보 CRUD
- SR 상태 관리 (승인요청 → 승인대기 → 승인 → 반려 → 취소)
- 파일 첨부/다운로드
- 승인 프로세스 연동

**비즈니스 규칙**:
1. SR 등록 시 요청부서 팀장 승인 필요
2. IT 부서 검토 후 최종 승인
3. 반려 시 수정 가능
4. 승인 완료 시 SPEC 생성 가능

**데이터 모델**:
```sql
service_requests:
  - sr_number: VARCHAR(20) UNIQUE (자동 채번)
  - title, business_requirement (TEXT)
  - sr_type: ENUM('DEVELOPMENT', 'OPERATION')
  - sr_category: VARCHAR(50)
  - status: ENUM('APPROVAL_REQUESTED', 'APPROVAL_PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')
  - project_id (FK)
  - requester_id (FK)
  - spec_id (FK, nullable)
```

**MVP 단계**: Phase 2

#### 3.1.2 운영 SR 관리 (Priority: High)
**복잡도**: ★★★☆☆ (3/5)

**주요 기능**:
- 운영 SR CRUD
- 데이터 추출 요청 (별도 승인 필요)
- 운영 정기 업무 등록

**SR 분류**:
- 자료요청
- 데이터변경요청
- 데이터검증요청
- 업무지원요청

**MVP 단계**: Phase 2

---

### 4.0 개발 모듈

#### 4.1.1 SPEC 관리 (Priority: Critical)
**복잡도**: ★★★★★ (5/5)

**주요 기능**:
- SPEC 정보 CRUD
- SPEC 상태 관리 (대기 → 진행중 → 승인대기 → 승인/반려 → 완료)
- FP/MD 관리
- 담당자 할당
- 파일 첨부

**비즈니스 규칙**:
1. 승인된 SR만 SPEC 생성 가능
2. SPEC 작성 시 FP(Function Point), MD(Man-Day) 산정 필수
3. 개발 리더/PM이 담당자 할당
4. 개발 완료 후 검토자 검토 필수
5. SPEC 승인 후 개발 진행

**데이터 모델**:
```sql
specifications:
  - spec_number: VARCHAR(20) UNIQUE
  - sr_id (FK)
  - status: ENUM('PENDING', 'IN_PROGRESS', 'APPROVAL_PENDING', 'APPROVED', 'REJECTED', 'COMPLETED')
  - function_point: DECIMAL(10,2)
  - man_day: DECIMAL(10,2)
  - assignee_id (FK)
  - reviewer_id (FK)
  - started_at, completed_at
```

**MVP 단계**: Phase 2

#### 4.1.2 개발진행관리 (Priority: High)
**복잡도**: ★★★★☆ (4/5)

**주요 기능**:
- 개발 진행 현황 조회 (분석, 설계, 개발, 테스트, 배포)
- 이슈 등록/조회/수정/삭제
- 이슈 상태 관리

**데이터 모델**:
```sql
issues:
  - issue_number: VARCHAR(20) UNIQUE
  - sr_id, spec_id (FK)
  - title, content
  - status: ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')
  - assignee_id, reporter_id (FK)
  - parent_issue_id (FK, self-reference)
```

**MVP 단계**: Phase 3

#### 4.1.3 릴리즈 관리 (Priority: High)
**복잡도**: ★★★★☆ (4/5)

**주요 기능**:
- 릴리즈 리스트 조회
- 릴리즈 등록/수정
- 릴리즈 승인 프로세스
- 릴리즈 유형 (긴급, 정기)

**비즈니스 규칙**:
1. 운영 PM이 배포 대상 수집 후 릴리즈 등록
2. 고객사 PM 승인 필요
3. 승인 전까지 수정 가능
4. 긴급 릴리즈는 즉시 처리

**MVP 단계**: Phase 3

---

### 5.0 승인 모듈

#### 5.1.1 승인관리 (Priority: Critical)
**복잡도**: ★★★★★ (5/5)

**주요 기능**:
- 승인 내역 조회
- 승인 확정/반려
- 승인 유형별 처리 (SR, SPEC, 릴리즈, 데이터추출)

**기술적 과제**:
- 다단계 승인 워크플로우
- 승인 라인 동적 구성
- 현재 단계 추적
- 승인/반려 알림

**데이터 모델**:
```sql
approvals:
  - approval_number: VARCHAR(20) UNIQUE
  - approval_type: ENUM('SR', 'SPEC', 'RELEASE', 'DATA_EXTRACTION')
  - target_id: BIGINT (polymorphic)
  - status: ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')
  - current_step, total_steps: INT
  
approval_lines:
  - approval_id (FK)
  - step_order: INT
  - approver_id (FK)
  - status, comment
  - approved_at
```

**승인 흐름 예시**:
```
SR 승인: 요청자 → 요청부서 팀장 → IT 부서 검토 → PM 승인
SPEC 승인: 작성자 → 개발 리더 → PM 승인
릴리즈 승인: 운영 PM → 고객사 PM
```

**MVP 단계**: Phase 2

---

### 6.0 장애 모듈

#### 6.1.1 장애/인시던트 관리 (Priority: High)
**복잡도**: ★★★★☆ (4/5)

**주요 기능**:
- 장애/인시던트 등록/조회/수정
- 장애 기준정보 관리
- 장애 등급 관리 (상, 중, 하)
- 장애보고서 관리
- 시스템 담당자 관리

**비즈니스 규칙**:
1. 장애 발생 시 즉시 등록
2. 장애 시스템 분류: 프로그램, 데이터, 서버인프라, 네트워크, PC
3. 업무구분: 주문, 물류, 배송, 정산 등
4. 긴급도별 SLA 준수
5. 장애보고서 작성 (타임라인, 현상, 원인, 조치결과, Action Item)

**데이터 모델**:
```sql
incidents:
  - incident_number: VARCHAR(20) UNIQUE
  - title, description
  - incident_type: ENUM('INCIDENT', 'FAILURE')
  - system_type: ENUM('PROGRAM', 'DATA', 'SERVER', 'NETWORK', 'PC')
  - business_area: VARCHAR(50)
  - severity: ENUM('HIGH', 'MEDIUM', 'LOW')
  - status: ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')
  - occurred_at, detected_at, resolved_at
  - resolution: TEXT
```

**MVP 단계**: Phase 3

---

### 7.0 파트너 모듈

#### 7.1.1 파트너관리 (Priority: Low)
**복잡도**: ★★☆☆☆ (2/5)

**주요 기능**:
- 파트너사 CRUD
- 폐업 관리

**MVP 단계**: Phase 3

---

### 8.0 자산관리 모듈

#### 8.1.1 IT 자산 관리 (Priority: Low)
**복잡도**: ★★☆☆☆ (2/5)

**주요 기능**:
- PC 및 IT 기기 CRUD
- 자산 유형별 관리
- 사용만료 관리

**MVP 단계**: Phase 3

---

### 9.0 통계 모듈

#### 9.1 통계관리 (Priority: Medium)
**복잡도**: ★★★★☆ (4/5)

**주요 기능**:
- 개발 SR 통계 (월별, 일별)
- 개발 완료 과제 리소스 통계
- 기간별/조직별 개발 공수 산정
- 운영 SR 통계
- 장애 통계 (월별, 시스템별)

**기술적 과제**:
- 집계 쿼리 최적화
- Materialized View 활용
- 실시간 vs 배치 집계 선택
- 차트 데이터 포맷

**MVP 단계**: Phase 3

---

## 🎯 MVP 3단계 전략 재확인

### Phase 1: 핵심 기반 (2-3주)
**목표**: 시스템 사용을 위한 기본 인프라 구축

**포함 기능**:
- ✅ 사용자 인증/인가 (JWT)
- ✅ 권한 관리 (RBAC)
- ✅ 사용자 관리
- ✅ 메뉴 관리
- ✅ 공통 UI 프레임워크

**성공 지표**:
- 로그인/로그아웃 정상 동작
- 권한 기반 메뉴 조회 가능
- 사용자 CRUD 가능

---

### Phase 2: 핵심 업무 흐름 (3-4주)
**목표**: SR → SPEC → 승인이라는 핵심 업무 프로세스 완성

**포함 기능**:
- ✅ 프로젝트 관리
- ✅ SR 관리 (개발/운영)
- ✅ SPEC 관리
- ✅ 승인 프로세스
- ✅ 파일 첨부/다운로드

**성공 지표**:
- SR 등록부터 승인까지 전체 플로우 동작
- SPEC 작성 및 담당자 할당 가능
- 다단계 승인 정상 동작

---

### Phase 3: 확장 기능 (4-5주)
**목표**: 핵심 업무를 지원하는 확장 기능 추가

**포함 기능**:
- ✅ 이슈 관리
- ✅ 릴리즈 관리
- ✅ 장애/인시던트 관리
- ✅ 통계
- ✅ 파트너/자산 관리
- ✅ 알림/배치

**성공 지표**:
- 전체 시스템 통합 동작
- 통계 데이터 정확성 검증
- 성능 요구사항 충족

---

## 📈 기술적 도전 과제

### 1. 복잡한 승인 워크플로우 (★★★★★)
**문제**:
- 승인 유형별로 다른 승인 라인
- 동적 승인자 변경
- 중간 단계 건너뛰기
- 승인/반려 알림

**해결 방안**:
```java
// Strategy Pattern 활용
public interface ApprovalStrategy {
    List<ApprovalLine> createApprovalLines(ApprovalRequest request);
    boolean canSkipStep(ApprovalLine line);
}

public class SrApprovalStrategy implements ApprovalStrategy {
    @Override
    public List<ApprovalLine> createApprovalLines(ApprovalRequest request) {
        // 요청부서 팀장 → IT 부서 → PM
        return Arrays.asList(
            ApprovalLine.of(1, requesterDeptManager),
            ApprovalLine.of(2, itDeptReviewer),
            ApprovalLine.of(3, projectManager)
        );
    }
}
```

### 2. 대용량 파일 처리 (★★★★☆)
**문제**:
- 파일 업로드/다운로드 성능
- 메모리 제한
- 동시 업로드 처리

**해결 방안**:
- Multipart 파일 처리
- Stream 기반 처리 (메모리 절약)
- 파일 크기 제한 (application.yml)
- 비동기 업로드 (향후)

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 100MB
```

### 3. 통계 데이터 성능 (★★★★☆)
**문제**:
- 대량 데이터 집계 느림
- 실시간 통계 요구

**해결 방안**:
- Materialized View
- 배치 집계 (일/월 단위)
- 인덱스 최적화
- 캐싱 (Redis 향후 도입)

```sql
CREATE MATERIALIZED VIEW mv_sr_monthly_stats AS
SELECT 
    project_id,
    DATE_TRUNC('month', request_date) as month,
    sr_type,
    status,
    COUNT(*) as total_count,
    AVG(man_day) as avg_man_day
FROM service_requests
WHERE deleted_at IS NULL
GROUP BY project_id, month, sr_type, status;

-- 매일 새벽 2시 갱신
CREATE INDEX idx_mv_sr_stats ON mv_sr_monthly_stats(project_id, month);
```

### 4. 자동 채번 (SR 번호, SPEC 번호 등) (★★★☆☆)
**문제**:
- 중복 방지
- 연도별/프로젝트별 채번
- 동시성 이슈

**해결 방안**:
```java
@Service
public class NumberingService {
    
    @Transactional
    public synchronized String generateSrNumber(Long projectId, LocalDate date) {
        String prefix = String.format("SR%s%02d", 
                date.getYear() % 100, 
                date.getMonthValue());
        
        Long sequence = srRepository.countByYearAndMonth(date.getYear(), date.getMonthValue());
        
        return String.format("%s-%04d", prefix, sequence + 1);
        // 결과: SR2510-0001
    }
}
```

### 5. Soft Delete 조회 성능 (★★★☆☆)
**문제**:
- 모든 조회에 `WHERE deleted_at IS NULL` 조건 필요
- 인덱스 활용 필요

**해결 방안**:
```sql
-- Partial Index (PostgreSQL)
CREATE INDEX idx_user_email_active ON users(email) 
WHERE deleted_at IS NULL;

-- JPA에서 자동 적용
@Where(clause = "deleted_at IS NULL")
@Entity
public class User extends BaseEntity {
    // ...
}
```

---

## 🚨 리스크 및 대응 방안

### 1. 개발 기간 부족
**리스크**: MVP 3단계 완료까지 12주 예상, 지연 가능성

**대응**:
- Phase별 우선순위 명확히
- 필수 기능 외 과감히 제외
- 주간 진행 상황 체크
- 조기 이슈 파악 및 해결

### 2. 요구사항 변경
**리스크**: 개발 중 요구사항 추가/변경

**대응**:
- 변경 관리 프로세스 수립
- 우선순위 재평가
- Phase별 Freeze 기간 설정

### 3. 기술적 난이도
**리스크**: 승인 워크플로우, 파일 처리 등 복잡한 기능

**대응**:
- POC (Proof of Concept) 우선 진행
- 오픈소스/라이브러리 적극 활용
- 기술 리뷰 세션 운영

### 4. 성능 이슈
**리스크**: 대량 데이터 처리 시 성능 저하

**대응**:
- 초기부터 인덱스 전략 수립
- 부하 테스트 (JMeter, Gatling)
- 쿼리 최적화
- 캐싱 전략 (Redis 도입 검토)

---

## ✅ 개발 체크리스트

### 시작 전 준비
- [ ] Git Repository 생성
- [ ] 개발 환경 구성 (Java, Docker, IDE)
- [ ] 팀 커뮤니케이션 채널 구성
- [ ] 개발 일정 공유

### Phase 1
- [ ] Spring Boot 프로젝트 초기화
- [ ] Docker Compose 환경 구성
- [ ] BaseEntity 및 Auditing 설정
- [ ] User, Role, Company Entity 설계 및 생성
- [ ] Flyway Migration 작성
- [ ] JWT 인증 구현
- [ ] 사용자 CRUD API 구현
- [ ] Swagger 문서 작성
- [ ] 단위 테스트 작성
- [ ] Phase 1 통합 테스트

### Phase 2
- [ ] Project Entity 설계
- [ ] SR, SPEC Entity 설계
- [ ] Approval Workflow 설계
- [ ] 파일 업로드/다운로드 구현
- [ ] SR CRUD API 구현
- [ ] SPEC CRUD API 구현
- [ ] 승인 프로세스 API 구현
- [ ] 통합 테스트 (SR → SPEC → 승인)
- [ ] 성능 테스트

### Phase 3
- [ ] Issue, Release, Incident Entity 설계
- [ ] 통계 로직 구현
- [ ] 배치 작업 구현
- [ ] 알림 시스템 구현
- [ ] 전체 통합 테스트
- [ ] 성능 최적화
- [ ] 문서화 완료
- [ ] 배포 준비

---

## 📚 참고 자료

### Spring Boot
- [Spring Boot Official Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Spring Security](https://spring.io/projects/spring-security)

### Architecture
- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

### Best Practices
- [Effective Java (Joshua Bloch)](https://www.oreilly.com/library/view/effective-java/9780134686097/)
- [RESTful API Design Best Practices](https://restfulapi.net/)

---

## 📊 예상 LOC (Lines of Code)

| 모듈 | Entity | Repository | Service | Controller | Test | Total |
|------|--------|------------|---------|------------|------|-------|
| Phase 1 | 1,500 | 500 | 2,000 | 1,500 | 3,000 | 8,500 |
| Phase 2 | 2,000 | 800 | 3,500 | 2,500 | 5,000 | 13,800 |
| Phase 3 | 1,500 | 600 | 2,500 | 2,000 | 4,000 | 10,600 |
| **Total** | **5,000** | **1,900** | **8,000** | **6,000** | **12,000** | **32,900** |

---

## 🎓 결론

ARIS 프로젝트는 엔터프라이즈급 IT 프로젝트 관리 시스템으로, 다음과 같은 특징을 가지고 있습니다:

### 강점
1. **명확한 비즈니스 프로세스**: SR → SPEC → 승인 → 개발 → 릴리즈
2. **체계적인 권한 관리**: RBAC 기반 세밀한 접근 제어
3. **확장 가능한 구조**: 모듈화된 설계로 점진적 확장 가능
4. **엔터프라이즈 요구사항 충족**: 승인, 파일, 배치, 통계 등

### 핵심 성공 요소
1. **명확한 MVP 전략**: 3단계로 나누어 점진적 개발
2. **기술 스택 선정**: Spring Boot + PostgreSQL + Docker (검증된 기술)
3. **테스트 전략**: 80% 이상 커버리지 목표
4. **문서화**: 설계서, API 명세서, 개발 가이드 완비

### 권장 사항
1. Phase 1 완료 후 사용자 피드백 수집
2. 복잡한 승인 워크플로우는 POC 먼저 진행
3. 성능 테스트는 각 Phase마다 실시
4. 코드 리뷰 문화 정착 (PR 기반)

**예상 개발 기간**: 12주 (약 3개월)
**예상 코드 라인 수**: 약 33,000 LOC
**권장 팀 구성**: Backend 2-3명, Frontend 2명, PM 1명

---

**Last Updated**: 2025-10-15
**Document Version**: 1.0.0









