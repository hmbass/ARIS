# ARIS 개선 요구사항 명세서

> **문서 버전**: 1.0  
> **기준 문서**: 솔루션 개발리스트_26.02.06 기준  
> **작성일**: 2026-04-06  
> **분석 기준 브랜치**: main

---

## 요약 (Executive Summary)

| 구분 | 항목 수 | 비고 |
|------|---------|------|
| 전체 요구사항 | 38개 | - |
| 프론트엔드 전용 | 28개 | UI/UX, 검색조건, 코드명칭 |
| 백엔드 포함 | 10개 | API 수정, 새 기능 |
| 신규 기능 (미구현) | 8개 | 공지사항, 세션, 이메일 등 |

---

## 요구사항 목록

### REQ-001 · 메인화면 헤더 — 사용자 정보 노출

| 항목 | 내용 |
|------|------|
| **메뉴** | 공통 (모든 화면) |
| **우선순위** | HIGH |
| **영향 범위** | Frontend only |

**요구사항**  
헤더에 로그인한 사용자의 **회사 / 부서 / 팀 / 이름** 을 노출한다.

**현재 상태**  
- `Header.tsx`: 이름과 회사명은 표시됨 (데스크탑 기준)  
- 부서(departmentName)는 user 객체에 존재하나 헤더에 미노출

**구현 방향**  
- `Header.tsx` 사용자 정보 영역에 `departmentName` 추가 표시  
- 표시 형식 예시: `한국정보시스템 · 개발팀 · 홍길동`  
- authStore의 `user.departmentName` 필드 활용 (백엔드 변경 불필요)

---

### REQ-002 · 프로젝트 조회 — 검색조건

| 항목 | 내용 |
|------|------|
| **메뉴** | 프로젝트 관리 |
| **우선순위** | HIGH |
| **영향 범위** | Frontend + Backend (API 파라미터 추가) |

**요구사항**  
프로젝트 목록 조회 화면에 아래 검색 조건을 추가한다.

| 검색 필드 | 노출 조건 |
|-----------|-----------|
| 회사 | 전체 시스템 권한자(`SYSTEM_ADMIN`)만 노출 |
| 프로젝트명 | 전체 노출 |
| 유형 (SI/SM) | 전체 노출 |
| PM | 전체 노출 |

**현재 상태**  
- `ProjectListPage.tsx`: 페이지네이션만 존재, 검색 조건 없음  
- 백엔드 `/api/projects` GET: 필터 파라미터 수용 여부 확인 필요

**구현 방향**  
- 상단 검색 바 컴포넌트 추가 (MUI `Grid` + `TextField`, `Select`)  
- 역할 체크: `user.roles.includes('ROLE_SYSTEM_ADMIN')` → 회사 필터 조건부 렌더링  
- 백엔드 `ProjectController` 쿼리 파라미터: `companyId`, `name`, `projectType`, `pmId`

---

### REQ-003 · 프로젝트 관리 — 코드값 한글 명칭 확인 및 추가

| 항목 | 내용 |
|------|------|
| **메뉴** | 프로젝트 관리 |
| **우선순위** | MEDIUM |
| **영향 범위** | Frontend only |

**요구사항**  
프로젝트 관련 enum 코드값의 UI 한글 명칭을 확인하고 누락된 항목을 추가한다.

**현재 상태 (확인됨)**  
현재 한글 매핑:
- `ProjectType`: SI → "SI", SM → "SM" (한글화 미적용 가능성)
- `ProjectStatus`: PREPARING → "준비", IN_PROGRESS → "진행중", COMPLETED → "완료", CANCELLED → "취소"

**구현 방향**  
- 목록/상세/등록 화면 내 모든 enum 표시값 한글화 검토  
- 공통 label map 객체 활용 또는 `getStatusLabel()` 헬퍼 함수 정의  
- 예: `{ SI: 'SI 프로젝트', SM: 'SM 프로젝트' }`

---

### REQ-004 · SR관리 조회 — 검색조건

| 항목 | 내용 |
|------|------|
| **메뉴** | SR관리 |
| **우선순위** | HIGH |
| **영향 범위** | Frontend + Backend |

**요구사항**  
SR 목록 조회 화면에 아래 검색 조건을 추가한다.

| 검색 필드 | 노출 조건 |
|-----------|-----------|
| 회사 | SYSTEM_ADMIN만 노출 |
| 프로젝트명 | 전체 노출 |
| 유형 (개발/운영) | 전체 노출 |
| 상태 | 전체 노출 |
| 우선순위 | 전체 노출 |

**현재 상태**  
- `SRListPage.tsx`: 페이지네이션만, 검색 조건 없음

**구현 방향**  
- 백엔드 파라미터: `companyId`, `projectName`, `srType`, `status`, `priority`

---

### REQ-005 · SR 관리 — 코드값 한글 명칭 확인 및 추가

| 항목 | 내용 |
|------|------|
| **메뉴** | SR관리 |
| **우선순위** | MEDIUM |
| **영향 범위** | Frontend only |

**요구사항**  
SR 관련 모든 enum의 한글 명칭 일관성 확인 및 누락 추가.

**확인 대상 enum**  
- `SrType`: DEVELOPMENT, OPERATION  
- `SrCategory`: NEW, CHANGE, DELETE, ETC  
- `SrStatus`: REQUESTED, APPROVAL_REQUESTED, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED, REJECTED  
- `Priority`: LOW, MEDIUM, HIGH, URGENT

---

### REQ-006 · SR 등록 — 사용자 조직 기준 프로젝트 필터

| 항목 | 내용 |
|------|------|
| **메뉴** | SR관리 > 등록 |
| **우선순위** | HIGH |
| **영향 범위** | Frontend + Backend |

**요구사항**  
SR 등록 화면의 프로젝트 선택 드롭다운을 전체 프로젝트가 아닌, **로그인 사용자의 조직(회사/부서)에 할당된 프로젝트만** 필터링하여 표시한다.

**현재 상태**  
- `SRCreatePage.tsx`: 전체 프로젝트 최대 100건 로딩, 조직 필터 없음

**구현 방향**  
- 백엔드: `GET /api/projects/my` 또는 `/api/projects?assignedToMe=true` 엔드포인트 추가  
- 또는 기존 API에 `companyId` 파라미터를 사용자 회사로 자동 주입  
- SYSTEM_ADMIN은 전체 프로젝트 조회 유지

---

### REQ-007 · SPEC관리 조회 — 검색조건

| 항목 | 내용 |
|------|------|
| **메뉴** | SPEC관리 |
| **우선순위** | HIGH |
| **영향 범위** | Frontend + Backend |

**요구사항**  

| 검색 필드 | 노출 조건 |
|-----------|-----------|
| 회사 | SYSTEM_ADMIN만 노출 |
| 프로젝트명 | 전체 노출 |
| SR ID | 전체 노출 |
| 유형 | 전체 노출 |
| 분류 | 전체 노출 |
| 상태 | 전체 노출 |

---

### REQ-008 · SPEC 관리 — 코드값 한글 명칭 확인 및 추가

| 항목 | 내용 |
|------|------|
| **메뉴** | SPEC관리 |
| **우선순위** | MEDIUM |
| **영향 범위** | Frontend only |

**확인 대상 enum**  
- `SpecType`: DEVELOPMENT, OPERATION  
- `SpecCategory`: ACCEPTED, CANCELLED  
- `SpecStatus`: DRAFT, REVIEW, APPROVED, REJECTED

---

### REQ-009 · SPEC 등록 — 사용자 조직 기준 프로젝트 내 SR 필터

| 항목 | 내용 |
|------|------|
| **메뉴** | SPEC관리 > 등록 |
| **우선순위** | HIGH |
| **영향 범위** | Frontend + Backend |

**요구사항**  
SPEC 등록 화면에서 SR 선택 시, **로그인 사용자 조직에 할당된 프로젝트 내의 SR만** 표시한다.

**구현 방향**  
- 프로젝트 선택 → 해당 프로젝트의 SR 목록 연계 조회  
- SR 필터: `projectId` 기준 + `status = APPROVED` 조건 권장

---

### REQ-010 · 승인관리 조회 — 검색조건

| 항목 | 내용 |
|------|------|
| **메뉴** | 승인관리 |
| **우선순위** | HIGH |
| **영향 범위** | Frontend + Backend |

**요구사항**  

| 검색 필드 | 노출 조건 |
|-----------|-----------|
| 회사 | SYSTEM_ADMIN만 노출 |
| 프로젝트명 | 전체 노출 |
| SR ID | 전체 노출 |
| SPEC ID | 전체 노출 |
| 유형 | 전체 노출 |
| 분류 | 전체 노출 |
| 상태 | 전체 노출 |

---

### REQ-011 · 승인관리 — 코드값 한글 명칭 확인 및 추가

| 항목 | 내용 |
|------|------|
| **메뉴** | 승인관리 |
| **우선순위** | MEDIUM |
| **영향 범위** | Frontend only |

**확인 대상 enum**  
- `ApprovalType`: SR, SPEC, RELEASE, DATA_EXTRACTION  
- `ApprovalStatus`: PENDING, APPROVED, REJECTED, CANCELLED  
- `ApprovalLineStatus`: PENDING, APPROVED, REJECTED

---

### REQ-012 · 이슈관리 조회 — 검색조건

| 항목 | 내용 |
|------|------|
| **메뉴** | 이슈관리 |
| **우선순위** | HIGH |
| **영향 범위** | Frontend + Backend |

**요구사항**  

| 검색 필드 | 노출 조건 |
|-----------|-----------|
| 회사 | SYSTEM_ADMIN만 노출 |
| 프로젝트명 | 전체 노출 |
| 이슈번호 | 전체 노출 |
| 유형 | 전체 노출 |
| 우선순위 | 전체 노출 |
| 상태 | 전체 노출 |

---

### REQ-013 · 이슈관리 — 코드값 한글 명칭 확인 및 추가

| 항목 | 내용 |
|------|------|
| **메뉴** | 이슈관리 |
| **우선순위** | MEDIUM |
| **영향 범위** | Frontend only |

**확인 대상 enum**  
- `IssueType`: BUG, IMPROVEMENT, NEW_FEATURE, TASK  
- `IssueStatus`: OPEN, IN_PROGRESS, RESOLVED, CLOSED  
- `Priority`: LOW, MEDIUM, HIGH, CRITICAL

---

### REQ-014 · 이슈관리 등록 — 사용자 조직 기준 프로젝트 필터

| 항목 | 내용 |
|------|------|
| **메뉴** | 이슈관리 > 등록 |
| **우선순위** | HIGH |
| **영향 범위** | Frontend + Backend |

**요구사항**  
이슈 등록 화면의 프로젝트 선택을 사용자 조직 기준으로 필터링한다.

---

### REQ-015 · 릴리즈 조회 — 검색조건

| 항목 | 내용 |
|------|------|
| **메뉴** | 릴리즈 |
| **우선순위** | HIGH |
| **영향 범위** | Frontend + Backend |

**요구사항**  

| 검색 필드 | 노출 조건 |
|-----------|-----------|
| 회사 | SYSTEM_ADMIN만 노출 |
| 프로젝트명 | 전체 노출 |
| 릴리즈번호 | 전체 노출 |
| 유형 | 전체 노출 |
| 상태 | 전체 노출 |

---

### REQ-016 · 릴리즈 관리 — 코드값 한글 명칭 확인 및 추가

| 항목 | 내용 |
|------|------|
| **메뉴** | 릴리즈 |
| **우선순위** | MEDIUM |
| **영향 범위** | Frontend only |

**확인 대상 enum**  
- `ReleaseType`: EMERGENCY, REGULAR  
- `ReleaseStatus`: REQUESTED, APPROVED, DEPLOYED, CANCELLED

---

### REQ-017 · 릴리즈 등록 — 사용자 조직 기준 프로젝트 필터

| 항목 | 내용 |
|------|------|
| **메뉴** | 릴리즈 > 등록 |
| **우선순위** | HIGH |
| **영향 범위** | Frontend + Backend |

---

### REQ-018 · 장애관리 조회 — 검색조건

| 항목 | 내용 |
|------|------|
| **메뉴** | 장애관리 |
| **우선순위** | HIGH |
| **영향 범위** | Frontend + Backend |

**요구사항**  

| 검색 필드 | 노출 조건 |
|-----------|-----------|
| 회사 | SYSTEM_ADMIN만 노출 |
| 프로젝트명 | 전체 노출 |
| 장애번호 | 전체 노출 |
| 심각도 | 전체 노출 |
| 상태 | 전체 노출 |

---

### REQ-019 · 장애관리 — 코드값 화면 명칭 확인 및 추가

| 항목 | 내용 |
|------|------|
| **메뉴** | 장애관리 |
| **우선순위** | MEDIUM |
| **영향 범위** | Frontend only |

**확인 대상 enum**  
- `Severity`: HIGH, MEDIUM, LOW  
- `IncidentStatus`: (현재 구조 확인 필요)  
- `SystemType`: (현재 구조 확인 필요)

---

### REQ-020 · 장애관리 등록 — 사용자 조직 기준 프로젝트 필터

| 항목 | 내용 |
|------|------|
| **메뉴** | 장애관리 > 등록 |
| **우선순위** | HIGH |
| **영향 범위** | Frontend + Backend |

---

### REQ-021 · 파트너 조회 — 검색조건

| 항목 | 내용 |
|------|------|
| **메뉴** | 파트너 |
| **우선순위** | HIGH |
| **영향 범위** | Frontend + Backend |

**요구사항**  

| 검색 필드 | 노출 조건 |
|-----------|-----------|
| 파트너명 | 전체 노출 |
| 대표자명 | 전체 노출 |
| 상태 (운영중/폐업) | 전체 노출 |

**비고**: 파트너는 회사 필터 없음 (글로벌 도메인)

---

### REQ-022 · 파트너 관리 — 코드값 화면 명칭 확인 및 추가

| 항목 | 내용 |
|------|------|
| **메뉴** | 파트너 |
| **우선순위** | MEDIUM |
| **영향 범위** | Frontend only |

**확인 대상**  
- `isClosed` 불리언 → "운영중" / "폐업" 한글 표시 여부

---

### REQ-023 · 자산관리 조회 — 검색조건

| 항목 | 내용 |
|------|------|
| **메뉴** | 자산관리 |
| **우선순위** | HIGH |
| **영향 범위** | Frontend + Backend |

**요구사항**  

| 검색 필드 | 노출 조건 |
|-----------|-----------|
| 회사 | SYSTEM_ADMIN만 노출 |
| 프로젝트명 | 전체 노출 |
| 자산번호 | 전체 노출 |
| 유형 | 전체 노출 |
| 상태 (만료/유효) | 전체 노출 |

**비고**: 자산에 프로젝트명 검색 조건이 있으나 현재 `assets` 테이블에 `project_id` 컬럼 없음 → 백엔드 스키마 확인 필요

---

### REQ-024 · 자산관리 — 코드값 화면 명칭 확인 및 추가

| 항목 | 내용 |
|------|------|
| **메뉴** | 자산관리 |
| **우선순위** | MEDIUM |
| **영향 범위** | Frontend only |

**확인 대상 enum**  
- `AssetType`: PC, LAPTOP, MONITOR, SERVER, NETWORK, PRINTER, OTHER  
- `isExpired`: 불리언 → "유효" / "만료" 표시

---

### REQ-025 · 자산관리 등록 — 사용자 조직 기준 프로젝트 필터

| 항목 | 내용 |
|------|------|
| **메뉴** | 자산관리 > 등록 |
| **우선순위** | MEDIUM |
| **영향 범위** | Frontend + Backend |

---

### REQ-026 · 사용자관리 조회 — 검색조건

| 항목 | 내용 |
|------|------|
| **메뉴** | 사용자관리 |
| **우선순위** | HIGH |
| **영향 범위** | Frontend + Backend |

**요구사항**  

| 검색 필드 | 노출 조건 |
|-----------|-----------|
| 회사 | SYSTEM_ADMIN만 노출 (또는 전체 어드민) |
| ID (이메일) | 전체 노출 |
| 이름 | 전체 노출 |
| 상태 | 전체 노출 |

---

### REQ-027 · 사용자관리 — 코드값 화면 명칭 확인 및 추가

| 항목 | 내용 |
|------|------|
| **메뉴** | 사용자관리 |
| **우선순위** | MEDIUM |
| **영향 범위** | Frontend only |

**확인 대상**  
- `isActive`, `isApproved`, `isLocked` 상태 표시 한글화

---

### REQ-028 · 패스워드 5회 오류 시 계정 잠금

| 항목 | 내용 |
|------|------|
| **메뉴** | 사용자관리 / 공통 |
| **우선순위** | MEDIUM |
| **영향 범위** | Backend + Frontend |

**요구사항**  
- 로그인 실패 5회 시 계정 자동 잠금 (`isLocked = true`)  
- 잠긴 계정은 어드민 화면에서 수동으로 해제  
- **현재는 잠금 기능 비활성화 상태로 유지 가능** (요구사항 메모 참조)

**현재 상태**  
- `users` 테이블에 `is_locked` 컬럼 존재  
- 로그인 실패 횟수 카운팅 로직 미구현

**구현 방향**  
- 백엔드: `loginFailCount` 컬럼 추가 또는 캐시 방식으로 카운팅  
- `AuthService.login()` 에서 실패 횟수 체크 후 잠금 처리  
- 어드민 사용자 관리 화면에 "잠금 해제" 버튼 추가

---

### REQ-029 · 회원가입 실패 시 로그인 화면 이동

| 항목 | 내용 |
|------|------|
| **메뉴** | 회원가입 |
| **우선순위** | LOW |
| **영향 범위** | Frontend only |

**요구사항**  
회원가입 실패(중복 이메일, 서버 오류 등) 시 로그인 화면으로 이동한다.

**현재 상태**  
- `RegisterPage.tsx`: 실패 시 Alert 메시지 표시 후 현재 페이지 유지  

**구현 방향**  
- catch 블록에서 `navigate('/login')` 호출로 변경  
- 또는 특정 에러 코드(중복 가입 등)에만 이동, 나머지는 에러 표시 유지 → 기획 확인 필요

---

### REQ-030 · 사이드바 메뉴 2뎁스 구조 변경

| 항목 | 내용 |
|------|------|
| **메뉴** | 공통 (Sidebar) |
| **우선순위** | MEDIUM |
| **영향 범위** | Frontend only |

**요구사항**  
현재 1뎁스(flat) 메뉴를 2뎁스(그룹 > 서브메뉴) 구조로 변경한다.

**현재 상태**  
- `Sidebar.tsx`: 전체 메뉴가 단일 레벨로 나열

**제안 2뎁스 분류**  
```
├── 대시보드
├── 개발관리
│   ├── 프로젝트
│   ├── SR관리
│   ├── SPEC관리
│   └── 승인관리
├── 운영관리
│   ├── 이슈관리
│   ├── 릴리즈
│   └── 장애관리
└── 자원관리
    ├── 파트너
    ├── 자산관리
    └── 사용자관리 (Admin)
```

**구현 방향**  
- MUI `Collapse` + `List`/`ListItemButton` 사용  
- 그룹 헤더 클릭 시 서브메뉴 펼침/접힘  
- 현재 활성 경로 기반으로 그룹 자동 펼침

---

### REQ-031 · 세션 타임아웃 관리

| 항목 | 내용 |
|------|------|
| **메뉴** | 공통 |
| **우선순위** | HIGH |
| **영향 범위** | Frontend (주) + Backend (설정) |

**요구사항**  
1. 로그인 후 세션 만료 시간 설정  
2. 세션 만료 임박 시 **"연장 / 로그아웃"** 팝업 표시  
3. 팝업에서 아무 액션 없이 세션 만료 시 로그인 페이지로 자동 이동

**현재 상태**  
- JWT accessToken: 1시간 유효 (backend 설정)  
- 프론트엔드: 세션 타임아웃 감지 로직 없음  
- 401/403 발생 시 리프레시 재시도 후 로그아웃 처리만 존재

**구현 방향**  
```
세션 타임아웃 플로우:
1. accessToken 디코드 → exp(만료시간) 추출
2. 만료 5분 전 경고 팝업 표시
3. "연장" 클릭 → /auth/refresh 호출
4. "로그아웃" 또는 무응답(60초) → clearAuth() + navigate('/login')
```
- 글로벌 타이머: `setInterval` 또는 `requestAnimationFrame` 활용  
- MUI `Dialog` 컴포넌트로 팝업 구현  
- `MainLayout.tsx` 또는 별도 `SessionManager` 컴포넌트로 분리

---

### REQ-032 · 공지사항 게시판 (대시보드)

| 항목 | 내용 |
|------|------|
| **메뉴** | 대시보드 / 신규 기능 |
| **우선순위** | MEDIUM |
| **영향 범위** | Frontend + Backend (신규) |

**요구사항**  
대시보드에 **시스템 공지 / 배포 공지** 게시판을 추가한다.

**현재 상태**  
- 공지사항 관련 테이블, API, UI 모두 미구현

**구현 방향**  
- **신규 테이블**: `announcements` (id, title, content, type, created_by, created_at)  
- **공지 유형**: `SYSTEM` (시스템 공지) / `DEPLOY` (배포 공지)  
- **백엔드**: `GET /api/announcements`, `POST /api/announcements` (어드민)  
- **프론트엔드**: 대시보드 내 공지사항 카드 컴포넌트  
- **Flyway**: `V4.0.0__create_announcements_table.sql` 추가

---

### REQ-033 · 조직/사원 공통 팝업 및 어드민 엑셀 업로드

| 항목 | 내용 |
|------|------|
| **메뉴** | 공통 |
| **우선순위** | MEDIUM |
| **영향 범위** | Frontend + Backend (신규) |

**요구사항**  
1. **조직 공통 코드 팝업**: 부서/팀 선택 시 트리 구조 팝업  
2. **사원 조회 팝업**: 담당자/승인자 선택 시 사원 검색 팝업  
3. **어드민 엑셀 업로드**: 조직/사원 데이터 일괄 등록

**현재 상태**  
- 담당자 선택: Select 드롭다운 방식 (사원 전체 로딩)  
- 엑셀 업로드: Apache POI 의존성 추가됨, API 미구현

**구현 방향**  
- **조직 팝업**: MUI `TreeView` 또는 중첩 `List` + `Dialog`  
- **사원 팝업**: 검색 + 페이지네이션 테이블 + `Dialog`  
- **엑셀 업로드**: `POST /api/admin/users/upload` (MultipartFile), Apache POI 파싱

---

### REQ-034 · 이메일 발송 기능

| 항목 | 내용 |
|------|------|
| **메뉴** | 공통 |
| **우선순위** | LOW |
| **영향 범위** | Backend (신규) |

**요구사항**  
이메일 발송 기능을 구현한다. (세부 트리거 시나리오 별도 협의 필요)

**현재 상태**  
- 이메일 관련 의존성, 서비스 모두 미구현

**구현 방향**  
- Spring Mail (`spring-boot-starter-mail`) 의존성 추가  
- `EmailService` 구현 (`JavaMailSender` 사용)  
- 발송 트리거 예상: 결재 요청, 승인/반려, 회원가입 승인 등  
- SMTP 서버 설정: `application.yml`에 외부화 필요

---

### REQ-035 · 개인정보 화면 — 공통 팝업

| 항목 | 내용 |
|------|------|
| **메뉴** | 공통 |
| **우선순위** | MEDIUM |
| **영향 범위** | Frontend only |

**요구사항**  
이메일, 이름, 부서(회사 / 본부 / 담당 / 팀) 정보를 표시하는 **개인정보 공통 팝업**을 설계한다.

**구현 방향**  
- 사원 이름 클릭 시 팝업 오픈  
- 표시 정보: 이메일, 이름, 회사, 본부, 담당, 팀  
- MUI `Popover` 또는 `Dialog` 컴포넌트 활용  
- 재사용 가능한 `UserInfoPopup` 컴포넌트로 구현

---

### REQ-036 · UI 레이아웃 공통 규칙

| 항목 | 내용 |
|------|------|
| **메뉴** | 공통 (디자인) |
| **우선순위** | MEDIUM |
| **영향 범위** | Frontend (전체 페이지) |

**요구사항**  
모든 화면에 아래 레이아웃 규칙을 적용한다:

1. **한 화면으로 구성** (스크롤 최소화)  
2. **버튼 위치**: 상단 우측 배치  
3. **상단 여백**: 타이트하게 (최소화)  
4. **제목**: 한 줄  
5. **버튼 크기**: 작게 (small/medium)  
6. **내용**: 버튼 아래 배치

**레이아웃 구조 (표준안)**:
```
┌─────────────────────────────────────────────────┐
│ [제목]                          [버튼1] [버튼2] │  ← 타이트한 상단 여백
├─────────────────────────────────────────────────┤
│ [검색 조건 영역]                                 │
├─────────────────────────────────────────────────┤
│ [본문 컨텐츠 (테이블/폼)]                        │
└─────────────────────────────────────────────────┘
```

**구현 방향**  
- 공통 `PageLayout` 또는 `PageHeader` 컴포넌트 추출  
- MUI `sx` 스타일 오버라이드로 일관성 적용

---

### REQ-037 · 프로젝트 등록 화면 — 3열 레이아웃 개편

| 항목 | 내용 |
|------|------|
| **메뉴** | 프로젝트 > 등록 |
| **우선순위** | MEDIUM |
| **영향 범위** | Frontend only |

**요구사항**  
프로젝트 등록 화면을 **기본 3열 레이아웃 (2~4열 유동)** 으로 개편한다.

**필드 배치 예시 (3열)**:
```
[프로젝트명]      [프로젝트 코드]   [유형]
[시작일]          [종료일]          [PM]
[회사]            [예산]            [상태]
[설명 - 전체 폭]
```

**구현 방향**  
- MUI `Grid` container/item 활용  
- `xs={12} sm={6} md={4}` 반응형 열 설정  
- 텍스트 입력(대용량)은 `xs={12}` 전체 폭 사용

---

### REQ-038 · 테스트용 가상 데이터 준비

| 항목 | 내용 |
|------|------|
| **메뉴** | 공통 (데이터) |
| **우선순위** | MEDIUM |
| **영향 범위** | Backend (Flyway 또는 별도 스크립트) |

**요구사항**  
전체 기능 테스트를 위한 가상(더미) 데이터를 준비한다.

**구현 방향**  
- Flyway `V99.9.0__insert_test_data.sql` 파일 작성  
- 또는 별도 `data/test-data.sql` 스크립트로 관리  
- 포함 데이터: 회사 2개, 부서 5개, 사용자 10명, 프로젝트 3개, SR 20건, SPEC 10건, 이슈 15건 등

---

## 구현 우선순위 매트릭스

### P0 — 즉시 착수 (사용성 핵심)

| ID | 요구사항 | 영향범위 | 복잡도 |
|----|---------|---------|--------|
| REQ-002 | 프로젝트 검색조건 | FE+BE | LOW |
| REQ-004 | SR 검색조건 | FE+BE | LOW |
| REQ-006 | SR 등록 조직 기준 프로젝트 필터 | FE+BE | MEDIUM |
| REQ-007 | SPEC 검색조건 | FE+BE | LOW |
| REQ-010 | 승인관리 검색조건 | FE+BE | LOW |
| REQ-012 | 이슈관리 검색조건 | FE+BE | LOW |
| REQ-015 | 릴리즈 검색조건 | FE+BE | LOW |
| REQ-018 | 장애관리 검색조건 | FE+BE | LOW |
| REQ-021 | 파트너 검색조건 | FE+BE | LOW |
| REQ-023 | 자산관리 검색조건 | FE+BE | LOW |
| REQ-026 | 사용자관리 검색조건 | FE+BE | LOW |
| REQ-031 | 세션 타임아웃 | FE | HIGH |
| REQ-001 | 헤더 사용자 정보 | FE | LOW |

### P1 — 단기 내 완료 (UX 개선)

| ID | 요구사항 | 영향범위 | 복잡도 |
|----|---------|---------|--------|
| REQ-003,005,008,011,013,016,019,022,024,027 | 각 도메인 코드값 한글화 | FE | LOW |
| REQ-030 | 사이드바 2뎁스 메뉴 | FE | MEDIUM |
| REQ-036 | UI 레이아웃 공통 규칙 | FE | MEDIUM |
| REQ-037 | 프로젝트 등록 3열 레이아웃 | FE | LOW |
| REQ-009 | SPEC 등록 SR 필터 | FE+BE | MEDIUM |
| REQ-014 | 이슈 등록 프로젝트 필터 | FE+BE | MEDIUM |

### P2 — 중기 개발 (신규 기능)

| ID | 요구사항 | 영향범위 | 복잡도 |
|----|---------|---------|--------|
| REQ-032 | 공지사항 게시판 | FE+BE (신규) | HIGH |
| REQ-033 | 조직/사원 팝업 + 엑셀 업로드 | FE+BE (신규) | HIGH |
| REQ-035 | 개인정보 공통 팝업 | FE | MEDIUM |
| REQ-028 | 패스워드 5회 잠금 | BE+FE | MEDIUM |
| REQ-038 | 테스트용 가상데이터 | BE | MEDIUM |

### P3 — 장기 개발

| ID | 요구사항 | 영향범위 | 복잡도 |
|----|---------|---------|--------|
| REQ-034 | 이메일 발송 | BE (신규) | HIGH |
| REQ-029 | 회원가입 실패 이동 | FE | LOW |
| REQ-017,020,025 | 등록 화면 프로젝트 필터 (릴리즈/장애/자산) | FE+BE | MEDIUM |

---

## 공통 패턴 — 반복 구현 지침

### 검색 조건 공통 패턴 (REQ-002 ~ REQ-026)

모든 목록 페이지 검색 조건은 아래 공통 구조를 따른다:

```typescript
// 1. 검색 상태
const [filters, setFilters] = useState({
  companyId: '',      // SYSTEM_ADMIN만 노출
  projectName: '',
  status: '',
  // ...도메인별 추가 필드
});

// 2. 검색 실행 (버튼 클릭 또는 Enter)
const handleSearch = () => {
  setPage(0);
  fetchData({ ...filters, page: 0, size: pageSize });
};

// 3. 초기화
const handleReset = () => {
  setFilters({});
  fetchData({ page: 0, size: pageSize });
};
```

### 회사 필터 권한 체크 공통 패턴

```typescript
const isSystemAdmin = user?.roles?.some(r => 
  ['ROLE_SYSTEM_ADMIN', 'SYSTEM_ADMIN'].includes(r)
);

// 렌더링
{isSystemAdmin && (
  <Select label="회사" value={filters.companyId} ... />
)}
```

### 조직 기준 프로젝트 필터 공통 패턴 (REQ-006, 009, 014, 017, 020, 025)

```typescript
// 등록 화면에서 프로젝트 로딩
const loadProjects = async () => {
  const params = isSystemAdmin 
    ? { size: 100 }
    : { companyId: user.companyId, size: 100 };  // 조직 기준 필터
  const res = await projectApi.getList(params);
  setProjects(res.content);
};
```

---

## 백엔드 API 변경 필요 목록

| 대상 API | 변경 내용 | 관련 REQ |
|----------|-----------|---------|
| `GET /api/projects` | `companyId`, `name`, `projectType`, `pmId` 파라미터 추가 | REQ-002 |
| `GET /api/srs` | `companyId`, `projectName`, `srType`, `status`, `priority` 추가 | REQ-004 |
| `GET /api/specs` | `companyId`, `projectName`, `srId`, `specType`, `specCategory`, `status` 추가 | REQ-007 |
| `GET /api/approvals` | `companyId`, `projectName`, `srId`, `specId`, `approvalType`, `status` 추가 | REQ-010 |
| `GET /api/issues` | `companyId`, `projectName`, `issueNumber`, `issueType`, `priority`, `status` 추가 | REQ-012 |
| `GET /api/releases` | `companyId`, `projectName`, `releaseNumber`, `releaseType`, `status` 추가 | REQ-015 |
| `GET /api/incidents` | `companyId`, `projectName`, `incidentNumber`, `severity`, `status` 추가 | REQ-018 |
| `GET /api/partners` | `name`, `ceoName`, `isClosed` 파라미터 추가 | REQ-021 |
| `GET /api/assets` | `companyId`, `assetNumber`, `assetType`, `isExpired` 추가 | REQ-023 |
| `GET /api/users` | `companyId`, `email`, `name`, `isActive` 추가 | REQ-026 |
| `GET /api/projects/my` | 신규: 로그인 사용자 조직 기준 프로젝트 목록 | REQ-006,014,017,020,025 |
| `POST /api/announcements` | 신규: 공지사항 생성 | REQ-032 |
| `GET /api/announcements` | 신규: 공지사항 목록 | REQ-032 |

---

## 확인이 필요한 사항

1. **REQ-023 자산관리 - 프로젝트명 검색**: `assets` 테이블에 `project_id` 컬럼이 현재 없음. 자산-프로젝트 연관 관계를 추가할지, 아니면 해당 검색 조건을 제거할지 결정 필요.

2. **REQ-029 회원가입 실패 처리**: "실패 시 로그인 화면으로 이동"인지, "특정 에러(중복 등)에만 이동"인지 세분화된 기획 확인 필요.

3. **REQ-030 2뎁스 메뉴 분류**: 위 제안된 그룹핑이 맞는지, 또는 다른 분류 기준이 있는지 확인 필요.

4. **REQ-031 세션 타임아웃 시간**: JWT accessToken 유효시간(현재 1시간)과 별개로 프론트엔드 비활동 타임아웃 시간 값 결정 필요.

5. **REQ-034 이메일 발송 트리거**: 어떤 이벤트(결재 요청, 승인/반려, 회원가입 등)에서 이메일을 발송할지 세부 시나리오 필요.
