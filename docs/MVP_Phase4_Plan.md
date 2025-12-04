# ARIS Phase 4 개발 계획서 (4개 MVP)

## 📋 문서 정보
- **작성일**: 2025-10-15
- **버전**: 1.0.0
- **Phase**: MVP Phase 4 (Advanced Features)
- **전략**: 4개의 독립적인 MVP로 단계별 개발

---

## 🎯 Phase 4 개요

Phase 3까지 완료된 백엔드 시스템을 기반으로, 사용자 경험 개선과 운영 효율성을 위한 4가지 핵심 기능을 순차적으로 개발합니다.

### Phase 4 목표
1. **사용자 접근성 향상** - 웹 프론트엔드 제공
2. **데이터 인사이트 제공** - 통계 및 리포트
3. **운영 자동화** - 배치 처리
4. **실시간 커뮤니케이션** - 알림 시스템

---

## 📅 Phase 4 MVP 구성

```
MVP 4.1: 프론트엔드 개발
    ↓
MVP 4.2: 통계 및 리포트
    ↓
MVP 4.3: 배치 처리
    ↓
MVP 4.4: 알림 시스템
```

---

## 🚀 MVP 4.1: 프론트엔드 개발

### 목표
백엔드 API를 활용한 React 기반 웹 프론트엔드 개발

### 기간
**6-8주** (예상)

### 기술 스택
| 구분 | 기술 |
|-----|------|
| **Framework** | React 18+ |
| **Language** | TypeScript |
| **State Management** | Redux Toolkit / Zustand |
| **UI Library** | Material-UI (MUI) / Ant Design |
| **HTTP Client** | Axios |
| **Router** | React Router v6 |
| **Form** | React Hook Form |
| **Build Tool** | Vite |
| **Testing** | Jest, React Testing Library |

### 주요 기능

#### 1.1 인증 및 레이아웃
- [ ] 로그인/로그아웃 페이지
- [ ] JWT 토큰 관리
- [ ] Private Route (인증 필요)
- [ ] 메인 레이아웃 (Header, Sidebar, Content)
- [ ] 반응형 디자인

#### 1.2 대시보드
- [ ] 프로젝트 현황 요약
- [ ] 내 업무 요약 (담당 SR, SPEC, 이슈)
- [ ] 승인 대기 건 알림
- [ ] 최근 활동 타임라인

#### 1.3 프로젝트 관리
- [ ] 프로젝트 목록 (테이블, 페이징)
- [ ] 프로젝트 등록 폼
- [ ] 프로젝트 상세 페이지
- [ ] 프로젝트 수정/삭제
- [ ] 검색 및 필터링

#### 1.4 SR 관리
- [ ] SR 목록 (개발/운영 탭)
- [ ] SR 등록 폼
- [ ] SR 상세 페이지
- [ ] SR 수정
- [ ] 파일 첨부/다운로드
- [ ] SR 상태 변경 (드롭다운)

#### 1.5 SPEC 관리
- [ ] SPEC 목록
- [ ] SPEC 등록 (SR 선택)
- [ ] SPEC 상세 페이지
- [ ] FP/MD 입력
- [ ] 담당자 할당
- [ ] 파일 첨부/다운로드

#### 1.6 승인 관리
- [ ] 승인 대기 목록
- [ ] 승인 요청 내역
- [ ] 승인/반려 처리
- [ ] 승인 라인 표시
- [ ] 승인 히스토리

#### 1.7 이슈 관리
- [ ] 이슈 목록
- [ ] 이슈 등록
- [ ] 이슈 상세 페이지
- [ ] 이슈 상태 변경 (칸반 보드)
- [ ] 이슈 담당자 변경

#### 1.8 릴리즈 관리
- [ ] 릴리즈 목록
- [ ] 릴리즈 등록 (정기/긴급)
- [ ] 릴리즈 승인 처리
- [ ] 릴리즈 일정 캘린더

#### 1.9 장애 관리
- [ ] 장애 목록
- [ ] 장애 등록
- [ ] 장애 상세 페이지
- [ ] 긴급도별 색상 구분
- [ ] 장애 처리 진행 상황

#### 1.10 파트너/자산 관리
- [ ] 파트너 목록
- [ ] 자산 목록
- [ ] 등록/수정 폼

#### 1.11 사용자 관리 (관리자)
- [ ] 사용자 목록
- [ ] 사용자 등록/수정
- [ ] 권한 부여
- [ ] 비밀번호 초기화

### 프로젝트 구조
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/                    # API 클라이언트
│   │   ├── auth.ts
│   │   ├── project.ts
│   │   ├── sr.ts
│   │   └── ...
│   ├── components/             # 재사용 컴포넌트
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Table.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainLayout.tsx
│   │   └── ...
│   ├── pages/                  # 페이지 컴포넌트
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── project/
│   │   │   ├── ProjectListPage.tsx
│   │   │   ├── ProjectDetailPage.tsx
│   │   │   └── ProjectFormPage.tsx
│   │   └── ...
│   ├── store/                  # Redux/Zustand Store
│   │   ├── auth/
│   │   ├── project/
│   │   └── ...
│   ├── types/                  # TypeScript 타입
│   │   ├── auth.types.ts
│   │   ├── project.types.ts
│   │   └── ...
│   ├── utils/                  # 유틸리티
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── ...
│   ├── App.tsx
│   ├── routes.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── Dockerfile
```

### 완료 조건
- [ ] 모든 화면 구현 완료
- [ ] 반응형 디자인 적용
- [ ] JWT 인증 정상 동작
- [ ] 모든 CRUD 기능 동작
- [ ] E2E 테스트 통과
- [ ] Docker 이미지 빌드 성공

---

## 📊 MVP 4.2: 통계 및 리포트

### 목표
데이터 분석 및 인사이트 제공을 위한 통계 기능 구현

### 기간
**3-4주** (예상)

### 기술 스택
| 구분 | 기술 |
|-----|------|
| **Chart Library** | Chart.js / Recharts |
| **Export** | Apache POI (Excel), iText (PDF) |
| **Scheduler** | Spring Scheduler |

### 주요 기능

#### 2.1 개발 SR 통계 (9.1.1)
- [ ] SR 현황 통계 API
  - 전체 SR 수
  - 상태별 SR 수 (승인요청/승인대기/승인/반려)
  - 우선순위별 SR 수
- [ ] 기간별 SR 추세 (월별, 분기별)
- [ ] 프로젝트별 SR 통계
- [ ] 요청자별 SR 통계
- [ ] 차트 시각화 (막대, 선, 파이)

#### 2.2 개발 완료 과제 리소스 통계 (9.1.2)
- [ ] 완료된 SPEC 통계 API
  - FP(Function Point) 합계
  - MD(Man-Day) 합계
  - 평균 FP/MD
- [ ] 담당자별 리소스 통계
- [ ] 월별 리소스 추세
- [ ] 프로젝트별 리소스 배분

#### 2.3 기간별 개발 공수 산정 (9.1.3)
- [ ] 기간별 공수 조회 API
  - 일별/주별/월별/분기별
  - 시작일~종료일 기간 선택
- [ ] 공수 산정 리포트
- [ ] 예상 vs 실제 비교

#### 2.4 조직별 개발 공수 산정 (9.1.4)
- [ ] 부서별 공수 통계 API
- [ ] 팀별 공수 통계
- [ ] 담당자별 업무량 분석

#### 2.5 운영 SR 통계 (9.1.5)
- [ ] 운영 SR 현황 통계 API
  - 분류별 통계 (자료요청/데이터변경/검증/지원)
  - 처리 시간 통계
- [ ] 월별 운영 SR 추세
- [ ] 요청부서별 통계

#### 2.6 장애 통계 (9.2.1, 9.2.2)
- [ ] 월별 장애 통계 API
  - 장애 발생 건수
  - 평균 처리 시간
  - 재발 건수
- [ ] 시스템별 장애 통계
  - 프로그램/데이터/서버/네트워크/PC
- [ ] 긴급도별 장애 분포
- [ ] 장애 원인 분석

#### 2.7 리포트 생성
- [ ] Excel 리포트 생성 API
- [ ] PDF 리포트 생성 API
- [ ] 리포트 템플릿 관리
- [ ] 이메일 전송 기능

#### 2.8 대시보드 위젯
- [ ] KPI 카드 (주요 지표)
- [ ] 실시간 차트
- [ ] 위젯 커스터마이징
- [ ] 대시보드 레이아웃 저장

### API 엔드포인트
```
# 통계 API
GET    /api/statistics/sr/summary              - SR 요약 통계
GET    /api/statistics/sr/trend                - SR 추세 (기간별)
GET    /api/statistics/sr/by-project           - 프로젝트별 SR 통계
GET    /api/statistics/resources/summary       - 리소스 요약
GET    /api/statistics/resources/by-assignee   - 담당자별 리소스
GET    /api/statistics/mandays/period          - 기간별 공수
GET    /api/statistics/mandays/organization    - 조직별 공수
GET    /api/statistics/incidents/monthly       - 월별 장애 통계
GET    /api/statistics/incidents/by-system     - 시스템별 장애 통계

# 리포트 API
POST   /api/reports/sr/excel                   - SR 리포트 생성 (Excel)
POST   /api/reports/sr/pdf                     - SR 리포트 생성 (PDF)
POST   /api/reports/incident/excel             - 장애 리포트 생성
POST   /api/reports/send-email                 - 리포트 이메일 전송
```

### 데이터베이스 설계
```sql
-- 리포트 템플릿
CREATE TABLE report_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- SR, SPEC, INCIDENT
    template_content TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

-- 리포트 생성 이력
CREATE TABLE report_histories (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT REFERENCES report_templates(id),
    report_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    generated_by VARCHAR(50) NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 완료 조건
- [ ] 모든 통계 API 구현 완료
- [ ] 차트 시각화 완료
- [ ] Excel/PDF 리포트 생성 성공
- [ ] 대시보드 위젯 동작
- [ ] 성능 테스트 통과 (대량 데이터 처리)

---

## ⚙️ MVP 4.3: 배치 처리

### 목표
정기적인 자동화 작업 및 백그라운드 작업 처리

### 기간
**2-3주** (예상)

### 기술 스택
| 구분 | 기술 |
|-----|------|
| **Scheduler** | Spring Scheduler / Quartz |
| **Async** | @Async, CompletableFuture |
| **Monitoring** | Spring Actuator |

### 주요 기능

#### 3.1 배치 작업 관리 (1.6.1, 1.6.2)
- [ ] 배치 작업 등록
- [ ] 배치 작업 수정/삭제
- [ ] 배치 작업 활성화/비활성화
- [ ] Cron 표현식 설정
- [ ] 배치 작업 목록 조회

#### 3.2 배치 스케줄 관리 (1.6.3)
- [ ] 스케줄 조회
- [ ] 스케줄 수동 실행
- [ ] 스케줄 일시 중지/재개
- [ ] 다음 실행 시간 계산

#### 3.3 배치 처리 내역 조회 (1.6.4)
- [ ] 배치 실행 이력
- [ ] 성공/실패 통계
- [ ] 실행 시간 통계
- [ ] 오류 로그 조회

#### 3.4 정기 배치 작업
- [ ] **일일 통계 집계**
  - 일별 SR 통계
  - 일별 이슈 통계
  - 일별 장애 통계
- [ ] **주간 리포트 생성**
  - 주간 SR 요약
  - 주간 장애 요약
  - PM에게 이메일 전송
- [ ] **월간 리포트 생성**
  - 월간 통계 리포트
  - 관리자에게 이메일 전송
- [ ] **데이터 백업**
  - 데이터베이스 자동 백업
  - 파일 백업
  - 외부 스토리지 전송
- [ ] **만료 데이터 정리**
  - 90일 이상 삭제된 데이터 물리 삭제
  - 임시 파일 정리
  - 오래된 로그 삭제

#### 3.5 비동기 작업 처리
- [ ] 대용량 Excel 다운로드
- [ ] 이메일 대량 발송
- [ ] 파일 일괄 업로드
- [ ] 데이터 일괄 등록

### API 엔드포인트
```
# 배치 관리 API
GET    /api/batch-jobs                    - 배치 작업 목록
POST   /api/batch-jobs                    - 배치 작업 등록
GET    /api/batch-jobs/{id}               - 배치 작업 상세
PUT    /api/batch-jobs/{id}               - 배치 작업 수정
DELETE /api/batch-jobs/{id}               - 배치 작업 삭제
POST   /api/batch-jobs/{id}/execute       - 배치 수동 실행
PUT    /api/batch-jobs/{id}/pause         - 배치 일시 중지
PUT    /api/batch-jobs/{id}/resume        - 배치 재개
GET    /api/batch-jobs/{id}/history       - 배치 실행 이력
GET    /api/batch-jobs/{id}/next-run      - 다음 실행 시간

# 비동기 작업 API
POST   /api/async/excel-download          - Excel 다운로드 요청
GET    /api/async/tasks/{taskId}/status   - 작업 상태 조회
GET    /api/async/tasks/{taskId}/result   - 작업 결과 조회
```

### 배치 작업 예시

#### 일일 통계 집계 (매일 새벽 2시)
```java
@Scheduled(cron = "0 0 2 * * *")
public void dailyStatisticsJob() {
    log.info("일일 통계 집계 시작");
    
    LocalDate yesterday = LocalDate.now().minusDays(1);
    
    // SR 통계
    statisticsService.aggregateDailySrStats(yesterday);
    
    // 이슈 통계
    statisticsService.aggregateDailyIssueStats(yesterday);
    
    // 장애 통계
    statisticsService.aggregateDailyIncidentStats(yesterday);
    
    log.info("일일 통계 집계 완료");
}
```

#### 주간 리포트 생성 (매주 월요일 오전 9시)
```java
@Scheduled(cron = "0 0 9 * * MON")
public void weeklyReportJob() {
    log.info("주간 리포트 생성 시작");
    
    LocalDate startDate = LocalDate.now().minusWeeks(1);
    LocalDate endDate = LocalDate.now().minusDays(1);
    
    // 리포트 생성
    byte[] report = reportService.generateWeeklyReport(startDate, endDate);
    
    // PM들에게 이메일 전송
    List<User> pms = userService.findUsersByRole("ROLE_PM");
    for (User pm : pms) {
        emailService.sendWeeklyReport(pm.getEmail(), report);
    }
    
    log.info("주간 리포트 생성 완료");
}
```

### 완료 조건
- [ ] 배치 작업 CRUD 완료
- [ ] 스케줄러 정상 동작
- [ ] 5개 이상의 정기 배치 작업 구현
- [ ] 비동기 작업 처리 완료
- [ ] 배치 모니터링 기능 구현

---

## 📢 MVP 4.4: 알림 시스템

### 목표
실시간 알림을 통한 사용자 커뮤니케이션 강화

### 기간
**2-3주** (예상)

### 기술 스택
| 구분 | 기술 |
|-----|------|
| **Email** | Spring Mail (SMTP) |
| **SMS** | 외부 SMS API (Twilio, Aligo 등) |
| **Push** | Firebase Cloud Messaging (선택) |
| **WebSocket** | Spring WebSocket (선택) |
| **Queue** | RabbitMQ / Kafka (선택) |

### 주요 기능

#### 4.1 SMS 알림 (1.4.1, 1.4.2)
- [ ] SMS 알림 요청 조회
- [ ] SMS 알림 요청 등록
- [ ] SMS 발송 처리
- [ ] SMS 발송 이력 조회
- [ ] SMS 템플릿 관리

#### 4.2 이메일 알림
- [ ] 이메일 템플릿 관리
- [ ] 이메일 발송 큐
- [ ] 이메일 발송 처리
- [ ] 이메일 발송 이력
- [ ] 첨부파일 지원

#### 4.3 알림 트리거

**SR 관련**
- [ ] SR 등록 시 → 담당 PM에게 알림
- [ ] SR 승인 요청 시 → 승인자에게 알림
- [ ] SR 승인/반려 시 → 요청자에게 알림
- [ ] SR 상태 변경 시 → 관련자에게 알림

**SPEC 관련**
- [ ] SPEC 할당 시 → 담당자에게 알림
- [ ] SPEC 승인 요청 시 → 검토자에게 알림
- [ ] SPEC 완료 시 → 요청자에게 알림

**승인 관련**
- [ ] 승인 대기 건 → 승인자에게 일일 요약 알림
- [ ] 승인 처리 완료 → 요청자에게 알림
- [ ] 승인 반려 시 → 요청자에게 알림 + 사유

**이슈 관련**
- [ ] 이슈 할당 시 → 담당자에게 알림
- [ ] 이슈 댓글 작성 시 → 관련자에게 알림
- [ ] 이슈 상태 변경 시 → 보고자에게 알림

**장애 관련**
- [ ] 긴급 장애 발생 시 → 즉시 SMS 알림
- [ ] 장애 할당 시 → 담당자에게 알림
- [ ] 장애 해결 시 → 보고자에게 알림

**릴리즈 관련**
- [ ] 릴리즈 예정 시 → D-1 알림
- [ ] 릴리즈 승인 요청 시 → 승인자에게 알림
- [ ] 릴리즈 배포 완료 시 → 관련자에게 알림

**마감일 관련**
- [ ] SR 마감일 D-3 → 담당자에게 알림
- [ ] SPEC 마감일 D-3 → 담당자에게 알림
- [ ] 마감일 경과 시 → 일일 알림

#### 4.4 알림 설정
- [ ] 사용자별 알림 설정
- [ ] 알림 채널 선택 (SMS/Email/Push)
- [ ] 알림 시간대 설정
- [ ] 알림 구독/해제
- [ ] Do Not Disturb 시간 설정

#### 4.5 알림 센터 (프론트엔드)
- [ ] 실시간 알림 표시
- [ ] 알림 목록 (읽음/안읽음)
- [ ] 알림 읽음 처리
- [ ] 알림 삭제
- [ ] 알림 클릭 시 해당 페이지 이동

### API 엔드포인트
```
# SMS 알림 API
GET    /api/notifications/sms              - SMS 알림 목록
POST   /api/notifications/sms              - SMS 발송 요청
GET    /api/notifications/sms/{id}         - SMS 알림 상세
POST   /api/notifications/sms/send         - SMS 즉시 발송
GET    /api/notifications/sms/history      - SMS 발송 이력

# 이메일 알림 API
GET    /api/notifications/email            - 이메일 알림 목록
POST   /api/notifications/email            - 이메일 발송 요청
POST   /api/notifications/email/send       - 이메일 즉시 발송
GET    /api/notifications/email/history    - 이메일 발송 이력

# 알림 설정 API
GET    /api/notifications/settings         - 알림 설정 조회
PUT    /api/notifications/settings         - 알림 설정 수정
POST   /api/notifications/subscribe        - 알림 구독
POST   /api/notifications/unsubscribe      - 알림 해제

# 알림 센터 API
GET    /api/notifications/my               - 내 알림 목록
GET    /api/notifications/unread-count     - 읽지 않은 알림 수
PUT    /api/notifications/{id}/read        - 알림 읽음 처리
DELETE /api/notifications/{id}             - 알림 삭제
POST   /api/notifications/read-all         - 모두 읽음 처리
```

### 데이터베이스 설계
```sql
-- 알림 테이블 (이미 존재)
-- notifications 테이블 확장 필요

-- 알림 설정
CREATE TABLE notification_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    notification_type VARCHAR(50) NOT NULL, -- SR_CREATED, SR_APPROVED, etc.
    channel VARCHAR(20) NOT NULL, -- SMS, EMAIL, PUSH
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notification_type, channel)
);

-- 알림 이력 (사용자별)
CREATE TABLE user_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link_url VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_read ON user_notifications(is_read);
```

### 알림 템플릿 예시

#### SR 승인 요청 (이메일)
```html
<!DOCTYPE html>
<html>
<head>
    <title>SR 승인 요청</title>
</head>
<body>
    <h2>SR 승인 요청</h2>
    <p>안녕하세요, {{approverName}}님</p>
    <p>새로운 SR 승인 요청이 도착했습니다.</p>
    
    <table>
        <tr><td>SR 번호:</td><td>{{srNumber}}</td></tr>
        <tr><td>제목:</td><td>{{srTitle}}</td></tr>
        <tr><td>요청자:</td><td>{{requesterName}}</td></tr>
        <tr><td>요청일:</td><td>{{requestDate}}</td></tr>
    </table>
    
    <p>
        <a href="{{approvalLink}}">승인하러 가기</a>
    </p>
</body>
</html>
```

#### 긴급 장애 발생 (SMS)
```
[ARIS 긴급] 
{{systemType}} 장애 발생
제목: {{incidentTitle}}
담당자: {{assigneeName}}
확인 요망
```

### 완료 조건
- [ ] SMS 발송 기능 완료
- [ ] 이메일 발송 기능 완료
- [ ] 10가지 이상의 알림 트리거 구현
- [ ] 알림 템플릿 관리 완료
- [ ] 알림 설정 기능 완료
- [ ] 프론트엔드 알림 센터 구현

---

## 📅 전체 일정

| MVP | 기간 | 주요 마일스톤 |
|-----|------|-------------|
| **4.1 프론트엔드** | 6-8주 | Week 1-2: 레이아웃 & 인증<br>Week 3-4: 프로젝트/SR/SPEC<br>Week 5-6: 이슈/릴리즈/장애<br>Week 7-8: 통합 & 테스트 |
| **4.2 통계** | 3-4주 | Week 1: 통계 API<br>Week 2: 리포트 생성<br>Week 3: 차트 & 대시보드<br>Week 4: 테스트 |
| **4.3 배치** | 2-3주 | Week 1: 배치 관리<br>Week 2: 정기 작업<br>Week 3: 비동기 처리 |
| **4.4 알림** | 2-3주 | Week 1: 알림 인프라<br>Week 2: 알림 트리거<br>Week 3: 알림 센터 |

**총 예상 기간: 13-18주 (약 3-4.5개월)**

---

## 🎯 성공 지표

### MVP 4.1 (프론트엔드)
- [ ] 모든 화면 구현율: 100%
- [ ] 반응형 지원: 모바일/태블릿/데스크톱
- [ ] 페이지 로딩 시간: 평균 2초 이하
- [ ] Lighthouse 점수: 80점 이상

### MVP 4.2 (통계)
- [ ] 통계 조회 성능: 1초 이내
- [ ] 리포트 생성 성능: 대용량(1000건) 5초 이내
- [ ] 차트 시각화: 10가지 이상

### MVP 4.3 (배치)
- [ ] 배치 작업 성공률: 99% 이상
- [ ] 배치 실행 이력: 100% 기록
- [ ] 오류 알림: 실시간

### MVP 4.4 (알림)
- [ ] 알림 발송 성공률: 99% 이상
- [ ] 알림 지연 시간: 평균 10초 이내
- [ ] 사용자 만족도: 4.0/5.0 이상

---

## 📚 참고 자료

### 프론트엔드
- [React Documentation](https://react.dev/)
- [Material-UI](https://mui.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Router](https://reactrouter.com/)

### 통계 및 리포트
- [Chart.js](https://www.chartjs.org/)
- [Apache POI](https://poi.apache.org/)
- [Spring Scheduler](https://spring.io/guides/gs/scheduling-tasks/)

### 배치 처리
- [Spring Batch](https://spring.io/projects/spring-batch)
- [Quartz Scheduler](http://www.quartz-scheduler.org/)

### 알림 시스템
- [Spring Mail](https://spring.io/guides/gs/sending-email/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Spring WebSocket](https://spring.io/guides/gs/messaging-stomp-websocket/)

---

## ✅ 다음 단계

### 즉시 시작 가능: MVP 4.1 프론트엔드 개발
1. ✅ 프로젝트 구조 설계
2. ⏳ React + TypeScript 프로젝트 생성
3. ⏳ 기본 레이아웃 구현
4. ⏳ 인증 페이지 구현
5. ⏳ API 클라이언트 구현

---

**Last Updated**: 2025-10-15
**Document Version**: 1.0.0









