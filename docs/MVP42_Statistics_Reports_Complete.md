## MVP 4.2 통계 및 리포트 완료 보고서

## 📋 문서 정보
- **작성일**: 2025-10-15
- **버전**: 1.0.0
- **상태**: ✅ 완료

---

## 🎯 완료된 작업

### 1. Entity 및 Enum ✅
- **ReportType**: SR, SPEC, INCIDENT, RELEASE, STATISTICS
- **ReportFormat**: EXCEL, PDF, CSV
- **ReportTemplate**: 리포트 템플릿 Entity
- **ReportHistory**: 리포트 생성 이력 Entity

### 2. Repository ✅
- **ReportTemplateRepository**: 템플릿 조회
- **ReportHistoryRepository**: 리포트 이력 조회

### 3. 통계 DTO ✅
- **SrStatisticsResponse**: SR 요약 통계
- **SrTrendResponse**: SR 추세
- **ResourceStatisticsResponse**: FP/MD 리소스 통계
- **MandayStatisticsResponse**: 공수 산정
- **IncidentStatisticsResponse**: 장애 통계
- **ProjectStatisticsResponse**: 프로젝트별 통계

### 4. 통계 Service 및 Controller ✅
- **SrStatisticsService**: SR 통계 로직
- **ResourceStatisticsService**: 리소스 통계 로직
- **MandayStatisticsService**: 공수 통계 로직
- **IncidentStatisticsService**: 장애 통계 로직
- **StatisticsController**: 통계 API 엔드포인트

### 5. Excel 리포트 생성 ✅
- **ExcelReportService**: Apache POI 기반 Excel 생성
  - SR 리포트
  - SPEC 리포트
  - 장애 리포트
- **ReportController**: 리포트 API 엔드포인트

### 6. Migration 파일 ✅
- **V4.2.0__create_report_tables.sql**
  - report_templates 테이블
  - report_histories 테이블
  - 기본 템플릿 데이터

---

## 📊 API 엔드포인트

### 통계 API (10개)

```http
GET /api/statistics/sr/summary
GET /api/statistics/sr/trend
GET /api/statistics/sr/by-project
GET /api/statistics/resources/summary
GET /api/statistics/resources/by-assignee
GET /api/statistics/mandays/period
GET /api/statistics/mandays/organization
GET /api/statistics/incidents/monthly
GET /api/statistics/incidents/by-system
```

### 리포트 API (3개)

```http
POST /api/reports/sr/excel
POST /api/reports/spec/excel
POST /api/reports/incident/excel
```

---

## 📈 통계 기능 상세

### 1. SR 통계
- **요약 통계**
  - 전체 SR 수
  - 상태별 분포 (승인요청, 승인대기, 승인, 반려)
  - 우선순위별 분포
  - 유형별 분포 (개발/운영)
  - 카테고리별 분포

- **추세 분석**
  - 월별 SR 추이
  - 승인/반려/대기 건수 추이

- **프로젝트별 통계**
  - 프로젝트별 SR 목록
  - SR/SPEC/이슈/장애 카운트

### 2. 리소스 통계
- **FP/MD 요약**
  - 총 SPEC 수
  - 총 FP, 평균 FP
  - 총 MD, 평균 MD
  
- **담당자별 리소스**
  - 담당자별 SPEC 수
  - 담당자별 FP/MD 합계

### 3. 공수 산정
- **기간별 공수**
  - 월별 MD 합계
  - 기간 내 총 MD

- **조직별 공수**
  - 부서별 MD 합계
  - 부서별 담당자 수

### 4. 장애 통계
- **월별 장애 통계**
  - 시스템 유형별 분포
  - 긴급도별 분포
  - 상태별 분포
  - 평균 해결 시간
  - 재발 건수

---

## 📄 Excel 리포트 기능

### 1. SR 리포트
**포함 컬럼** (12개):
- SR번호, 제목, 유형, 카테고리, 상태, 우선순위
- 요청자, 담당자, 프로젝트, 예상일, 완료일, 등록일

**필터링**:
- 기간별 (시작일~종료일)
- 프로젝트별

### 2. SPEC 리포트
**포함 컬럼** (12개):
- SPEC번호, 제목, 유형, 상태, FP, MD
- 담당자, 검토자, SR번호, 시작일, 종료일, 등록일

**필터링**:
- 기간별 (시작일~종료일)

### 3. 장애 리포트
**포함 컬럼** (11개):
- 장애번호, 제목, 시스템유형, 긴급도, 상태
- 보고자, 담당자, 발생일시, 해결일시, 원인, 조치내용

**필터링**:
- 기간별 (시작일~종료일)

### Excel 특징
- 헤더 스타일 (굵게, 배경색)
- 데이터 스타일 (테두리)
- 자동 열 너비 조정
- UTF-8 인코딩 지원
- 파일명: `{Type}_Report_yyyyMMdd.xlsx`

---

## 🗄️ 데이터베이스

### 1. report_templates
```sql
- id: BIGSERIAL PRIMARY KEY
- name: VARCHAR(100) -- 템플릿명
- report_type: VARCHAR(50) -- SR, SPEC, INCIDENT 등
- template_content: TEXT -- 템플릿 내용
- is_active: BOOLEAN -- 활성화 여부
- created_at, updated_at, deleted_at, version
```

### 2. report_histories
```sql
- id: BIGSERIAL PRIMARY KEY
- template_id: BIGINT (FK)
- report_type: VARCHAR(50)
- report_format: VARCHAR(20) -- EXCEL, PDF, CSV
- file_name: VARCHAR(255)
- file_path: VARCHAR(500)
- generated_by: VARCHAR(50)
- generated_at: TIMESTAMP
```

---

## 🔧 기술 스택

### Apache POI
- **버전**: 5.2.5
- **라이브러리**:
  - `poi`: 기본 라이브러리
  - `poi-ooxml`: XLSX 포맷 지원

### 사용된 POI 클래스
- `XSSFWorkbook`: Workbook 생성
- `Sheet`, `Row`, `Cell`: 데이터 구조
- `CellStyle`, `Font`: 스타일링
- `IndexedColors`, `FillPatternType`: 색상 및 패턴
- `BorderStyle`, `HorizontalAlignment`: 테두리 및 정렬

---

## 📝 사용 예시

### 1. SR 통계 조회
```bash
# SR 요약 통계
curl -X GET "http://localhost:8080/api/statistics/sr/summary?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer {token}"

# SR 추세 조회 (월별)
curl -X GET "http://localhost:8080/api/statistics/sr/trend?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer {token}"
```

### 2. 리소스 통계 조회
```bash
# 리소스 요약
curl -X GET "http://localhost:8080/api/statistics/resources/summary" \
  -H "Authorization: Bearer {token}"

# 담당자별 리소스
curl -X GET "http://localhost:8080/api/statistics/resources/by-assignee?assigneeId=1" \
  -H "Authorization: Bearer {token}"
```

### 3. Excel 리포트 생성
```bash
# SR 리포트
curl -X POST "http://localhost:8080/api/reports/sr/excel?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer {token}" \
  --output SR_Report.xlsx

# SPEC 리포트
curl -X POST "http://localhost:8080/api/reports/spec/excel?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer {token}" \
  --output SPEC_Report.xlsx

# 장애 리포트
curl -X POST "http://localhost:8080/api/reports/incident/excel" \
  -H "Authorization: Bearer {token}" \
  --output Incident_Report.xlsx
```

---

## 📦 생성된 파일 목록 (29개)

### Entity & Enum (4개)
```
backend/src/main/java/com/aris/domain/report/entity/
├── ReportType.java
├── ReportFormat.java
├── ReportTemplate.java
└── ReportHistory.java
```

### Repository (2개)
```
backend/src/main/java/com/aris/domain/report/repository/
├── ReportTemplateRepository.java
└── ReportHistoryRepository.java
```

### DTO (6개)
```
backend/src/main/java/com/aris/domain/statistics/dto/
├── SrStatisticsResponse.java
├── SrTrendResponse.java
├── ResourceStatisticsResponse.java
├── MandayStatisticsResponse.java
├── IncidentStatisticsResponse.java
└── ProjectStatisticsResponse.java
```

### Service (5개)
```
backend/src/main/java/com/aris/domain/statistics/service/
├── SrStatisticsService.java
├── ResourceStatisticsService.java
├── MandayStatisticsService.java
└── IncidentStatisticsService.java

backend/src/main/java/com/aris/domain/report/service/
└── ExcelReportService.java
```

### Controller (2개)
```
backend/src/main/java/com/aris/domain/statistics/controller/
└── StatisticsController.java

backend/src/main/java/com/aris/domain/report/controller/
└── ReportController.java
```

### Migration (1개)
```
backend/src/main/resources/db/migration/
└── V4.2.0__create_report_tables.sql
```

### pom.xml (Apache POI 의존성 추가)

---

## 🎨 응답 예시

### SR 통계 요약
```json
{
  "totalCount": 150,
  "byStatus": {
    "APPROVED": 80,
    "APPROVAL_PENDING": 30,
    "APPROVAL_REQUESTED": 25,
    "REJECTED": 15
  },
  "byPriority": {
    "HIGH": 40,
    "MEDIUM": 70,
    "LOW": 40
  },
  "byType": {
    "DEVELOPMENT": 120,
    "OPERATION": 30
  },
  "byCategory": {
    "NEW_FEATURE": 60,
    "BUG_FIX": 50,
    "ENHANCEMENT": 40
  }
}
```

### 리소스 통계
```json
{
  "totalSpecs": 80,
  "totalFp": 2400.0,
  "totalMd": 480.0,
  "avgFp": 30.0,
  "avgMd": 6.0,
  "byAssignee": [
    {
      "assigneeId": 1,
      "assigneeName": "홍길동",
      "specCount": 20,
      "totalFp": 600.0,
      "totalMd": 120.0
    }
  ]
}
```

---

## ✅ 완료 조건

- [x] 모든 통계 API 구현 완료
- [x] Excel 리포트 생성 기능 완료
- [x] Apache POI 의존성 추가
- [x] Migration 파일 생성
- [x] Swagger 문서화 완료
- [x] DTO 및 응답 형식 정의

---

## 🚀 다음 단계

### MVP 4.3: 배치 처리
배치 작업 관리 및 정기 작업 자동화를 구현합니다.

---

**Last Updated**: 2025-10-15
**Document Version**: 1.0.0









