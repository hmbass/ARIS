# 🎉 ARIS Phase 2 기반 구조 완료

**작성일시**: 2025-10-15  
**상태**: ✅ Phase 2 기반 구조 완료 (Entity, Repository, Enum, Migration)

---

## 📋 완료된 작업

### 1. ✅ ErrorCode 확장

Phase 2 관련 오류 코드 추가 완료:

#### 프로젝트 관련
- `PROJECT_NOT_FOUND` - 프로젝트를 찾을 수 없습니다
- `DUPLICATE_PROJECT_CODE` - 이미 존재하는 프로젝트 코드입니다
- `INVALID_PROJECT_STATUS` - 유효하지 않은 프로젝트 상태입니다

#### SR 관련
- `SR_NOT_FOUND` - SR을 찾을 수 없습니다
- `DUPLICATE_SR_NUMBER` - 이미 존재하는 SR 번호입니다
- `INVALID_SR_STATUS` - 유효하지 않은 SR 상태입니다
- `SR_CANNOT_BE_MODIFIED` - 해당 상태에서는 SR을 수정할 수 없습니다
- `SR_ALREADY_APPROVED` - 이미 승인된 SR입니다

#### SPEC 관련
- `SPEC_NOT_FOUND` - SPEC을 찾을 수 없습니다
- `DUPLICATE_SPEC_NUMBER` - 이미 존재하는 SPEC 번호입니다
- `INVALID_SPEC_STATUS` - 유효하지 않은 SPEC 상태입니다
- `SPEC_CANNOT_BE_CREATED` - 승인된 SR만 SPEC을 생성할 수 있습니다
- `SPEC_CANNOT_BE_MODIFIED` - 해당 상태에서는 SPEC을 수정할 수 없습니다

#### 승인 관련
- `APPROVAL_NOT_FOUND` - 승인 정보를 찾을 수 없습니다
- `DUPLICATE_APPROVAL_NUMBER` - 이미 존재하는 승인 번호입니다
- `INVALID_APPROVAL_STATUS` - 유효하지 않은 승인 상태입니다
- `NOT_APPROVAL_AUTHORITY` - 승인 권한이 없습니다
- `APPROVAL_ALREADY_PROCESSED` - 이미 처리된 승인입니다
- `INVALID_APPROVAL_STEP` - 유효하지 않은 승인 단계입니다

#### 파일 관련
- `FILE_NOT_FOUND` - 파일을 찾을 수 없습니다
- `FILE_UPLOAD_FAILED` - 파일 업로드에 실패했습니다
- `FILE_SIZE_EXCEEDED` - 파일 크기가 제한을 초과했습니다
- `INVALID_FILE_TYPE` - 허용되지 않는 파일 형식입니다

---

### 2. ✅ Enum 클래스 생성

#### 프로젝트 관련
```
✅ ProjectType.java        (SI, SM)
✅ ProjectStatus.java      (PREPARING, IN_PROGRESS, COMPLETED, CANCELLED)
```

#### SR 관련
```
✅ SrType.java             (DEVELOPMENT, OPERATION)
✅ SrCategory.java         (AP_DEVELOPMENT, DATA_REQUEST, DATA_CHANGE_REQUEST 등)
✅ SrStatus.java           (APPROVAL_REQUESTED, APPROVAL_PENDING, APPROVED, REJECTED, CANCELLED)
```

#### SPEC 관련
```
✅ SpecType.java           (DEVELOPMENT, OPERATION)
✅ SpecCategory.java       (ACCEPTED, CANCELLED)
✅ SpecStatus.java         (PENDING, IN_PROGRESS, APPROVAL_PENDING, APPROVED, REJECTED, COMPLETED)
```

#### 승인 관련
```
✅ ApprovalType.java       (SR, SPEC, RELEASE, DATA_EXTRACTION)
✅ ApprovalStatus.java     (PENDING, APPROVED, REJECTED, CANCELLED)
✅ ApprovalLineStatus.java (PENDING, APPROVED, REJECTED)
```

---

### 3. ✅ Flyway Migration 파일 생성

```
✅ V2.0.0__create_projects_table.sql
✅ V2.0.1__create_service_requests_table.sql
✅ V2.0.2__create_sr_files_table.sql
✅ V2.0.3__create_specifications_table.sql
✅ V2.0.4__create_spec_files_table.sql
✅ V2.0.5__create_approvals_table.sql
✅ V2.0.6__create_approval_lines_table.sql
✅ V2.0.7__add_foreign_key_spec_to_sr.sql
```

**주요 특징**:
- CHECK 제약 조건으로 Enum 값 검증
- 복합 인덱스로 검색 성능 최적화
- 외래키 제약 조건으로 데이터 무결성 보장
- CASCADE DELETE로 첨부파일 자동 삭제
- 상세한 COMMENT로 문서화

---

### 4. ✅ Entity 클래스 생성

#### Project Entity (`com.aris.domain.project.entity.Project`)
```java
- id, code, name, projectType, status
- startDate, endDate, company, description, budget, pm
- 비즈니스 메서드: updateInfo(), changeStatus(), assignPm()
```

#### ServiceRequest Entity (`com.aris.domain.sr.entity.ServiceRequest`)
```java
- id, srNumber, title, srType, srCategory, status
- businessRequirement, project, requester, requesterDept
- requestDate, dueDate, priority, releaseDate, releaseNumber, specification
- 비즈니스 메서드: updateInfo(), changeStatus(), linkSpecification()
```

#### SrFile Entity (`com.aris.domain.sr.entity.SrFile`)
```java
- id, serviceRequest, originalFilename, storedFilename
- filePath, fileSize, contentType, uploadedAt, uploadedBy
```

#### Specification Entity (`com.aris.domain.spec.entity.Specification`)
```java
- id, specNumber, serviceRequest, specType, specCategory, status
- functionPoint, manDay, assignee, reviewer
- startedAt, completedAt
- 비즈니스 메서드: updateInfo(), assignTo(), startWork(), complete()
```

#### SpecFile Entity (`com.aris.domain.spec.entity.SpecFile`)
```java
- id, specification, originalFilename, storedFilename
- filePath, fileSize, contentType, uploadedAt, uploadedBy
```

#### Approval Entity (`com.aris.domain.approval.entity.Approval`)
```java
- id, approvalNumber, approvalType, targetId, status
- currentStep, totalSteps, requester, requestedAt, completedAt
- approvalLines (OneToMany)
- 비즈니스 메서드: approve(), reject(), cancel()
```

#### ApprovalLine Entity (`com.aris.domain.approval.entity.ApprovalLine`)
```java
- id, approval, stepOrder, approver, status
- comment, approvedAt, createdAt
- 비즈니스 메서드: approve(), reject()
```

---

### 5. ✅ Repository 인터페이스 생성

#### ProjectRepository
```java
- findByCode(), existsByCode()
- findByCompanyId(), findByStatus(), findByPmId()
- search() - 이름, 유형, 상태, 회사, 기간별 검색
```

#### ServiceRequestRepository
```java
- findBySrNumber(), existsBySrNumber()
- findByProjectId(), findByRequesterId()
- search() - 제목, 유형, 상태, 프로젝트, 요청자, 기간별 검색
- countByYearAndMonth() - 자동 채번용
```

#### SrFileRepository
```java
- findByServiceRequestId()
- countByServiceRequestId()
```

#### SpecificationRepository
```java
- findBySpecNumber(), existsBySpecNumber()
- findByServiceRequestId(), findByAssigneeId()
- search() - 유형, 상태, 담당자, 기간별 검색
- countByYearAndMonth() - 자동 채번용
```

#### SpecFileRepository
```java
- findBySpecificationId()
- countBySpecificationId()
```

#### ApprovalRepository
```java
- findByApprovalNumber(), existsByApprovalNumber()
- findByApprovalTypeAndTargetId(), findByRequesterId()
- findPendingApprovalsByApproverId() - 승인자의 대기 건
- search() - 유형, 상태, 요청자별 검색
- countByYearAndMonth() - 자동 채번용
```

#### ApprovalLineRepository
```java
- findByApprovalId(), findByApproverId()
```

---

## 🎯 현재 구조

```
backend/src/main/java/com/aris/
├── domain/
│   ├── project/
│   │   ├── entity/
│   │   │   ├── Project.java ✅
│   │   │   ├── ProjectType.java ✅
│   │   │   └── ProjectStatus.java ✅
│   │   └── repository/
│   │       └── ProjectRepository.java ✅
│   ├── sr/
│   │   ├── entity/
│   │   │   ├── ServiceRequest.java ✅
│   │   │   ├── SrFile.java ✅
│   │   │   ├── SrType.java ✅
│   │   │   ├── SrCategory.java ✅
│   │   │   └── SrStatus.java ✅
│   │   └── repository/
│   │       ├── ServiceRequestRepository.java ✅
│   │       └── SrFileRepository.java ✅
│   ├── spec/
│   │   ├── entity/
│   │   │   ├── Specification.java ✅
│   │   │   ├── SpecFile.java ✅
│   │   │   ├── SpecType.java ✅
│   │   │   ├── SpecCategory.java ✅
│   │   │   └── SpecStatus.java ✅
│   │   └── repository/
│   │       ├── SpecificationRepository.java ✅
│   │       └── SpecFileRepository.java ✅
│   └── approval/
│       ├── entity/
│       │   ├── Approval.java ✅
│       │   ├── ApprovalLine.java ✅
│       │   ├── ApprovalType.java ✅
│       │   ├── ApprovalStatus.java ✅
│       │   └── ApprovalLineStatus.java ✅
│       └── repository/
│           ├── ApprovalRepository.java ✅
│           └── ApprovalLineRepository.java ✅
└── global/
    └── exception/
        └── ErrorCode.java ✅ (Phase 2 오류 코드 추가)
```

---

## 📊 빌드 결과

```bash
[INFO] BUILD SUCCESS
[INFO] Total time:  2.976 s
[INFO] Finished at: 2025-10-15T14:20:52+09:00
```

**컴파일 성공**: 모든 Entity, Enum, Repository가 정상적으로 컴파일되었습니다.

---

## 🚀 다음 단계 (Phase 2 계속)

### 1. DTO 클래스 생성 (다음 작업)
```
- ProjectRequest, ProjectResponse
- SrCreateRequest, SrUpdateRequest, SrResponse
- SpecRequest, SpecResponse
- ApprovalRequest, ApprovalResponse
- FileUploadResponse
```

### 2. Service 클래스 생성
```
- ProjectService
- ServiceRequestService
- SpecificationService
- ApprovalService
- FileStorageService (파일 업로드/다운로드)
```

### 3. Controller 클래스 생성
```
- ProjectController
- ServiceRequestController
- SpecificationController
- ApprovalController
```

### 4. 자동 채번 서비스
```
- NumberingService (SR, SPEC, Approval 번호 자동 생성)
```

### 5. 통합 테스트
```
- 전체 프로세스 테스트: SR 등록 → 승인 → SPEC 생성 → 승인 → 완료
```

---

## 💡 주요 비즈니스 로직 구현

### SR 상태 전이
```
APPROVAL_REQUESTED → APPROVAL_PENDING → APPROVED → (SPEC 생성 가능)
                  ↘                  ↗
                    REJECTED (수정 후 재요청 가능)
```

### SPEC 상태 전이
```
PENDING → IN_PROGRESS → APPROVAL_PENDING → APPROVED → COMPLETED
                     ↘                  ↗
                       REJECTED (수정 후 재요청 가능)
```

### 승인 프로세스
```
1단계 승인 → 2단계 승인 → ... → N단계 승인 → 승인 완료
         ↘ 반려 (어느 단계에서든 가능)
```

---

## 🔑 핵심 기능

### 1. Soft Delete 지원
- 모든 Entity는 `BaseEntity`를 상속하여 `deletedAt` 필드 보유
- 물리적 삭제 없이 논리적 삭제만 수행

### 2. Auditing 지원
- `createdAt`, `createdBy`, `updatedAt`, `updatedBy` 자동 관리
- `@EntityListeners(AuditingEntityListener.class)` 적용

### 3. Optimistic Locking
- `version` 필드로 동시성 제어

### 4. 비즈니스 규칙 검증
- Entity 내부에서 비즈니스 규칙 검증
- 예: SR 수정 가능 여부, SPEC 생성 가능 여부, 승인 권한 확인 등

---

## 📈 데이터베이스 스키마

### 테이블 개수: 7개
1. `projects` - 프로젝트
2. `service_requests` - SR
3. `sr_files` - SR 첨부파일
4. `specifications` - SPEC
5. `spec_files` - SPEC 첨부파일
6. `approvals` - 승인
7. `approval_lines` - 승인라인

### 관계
```
projects (1) ←→ (N) service_requests (1) ←→ (1) specifications
                      ↓                              ↓
                  sr_files (N)                  spec_files (N)

service_requests/specifications → approvals (1) ←→ (N) approval_lines
```

---

## ✅ 검증 완료

- [x] 모든 Enum 클래스 생성 완료
- [x] 모든 Flyway Migration 파일 작성 완료
- [x] 모든 Entity 클래스 생성 완료
- [x] 모든 Repository 인터페이스 생성 완료
- [x] ErrorCode 확장 완료
- [x] Maven 컴파일 성공

---

## 🎉 결과

**Phase 2의 핵심 기반 구조가 완성되었습니다!**

이제 DTO, Service, Controller를 구현하면 SR → SPEC → 승인 프로세스가 완전히 동작하게 됩니다.

---

**작성자**: AI Assistant  
**프로젝트**: ARIS (Advanced Request & Issue Management System)  
**Phase**: MVP Phase 2 - 기반 구조 완료









