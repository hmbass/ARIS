# 🧪 ARIS Phase 2 - 지금 바로 테스트하기!

## 🎯 바로 시작하기 (3분 완성)

### Step 1: Swagger UI 열기 (1분)
브라우저에서 다음 URL을 열어주세요:
```
http://localhost:8080/swagger-ui.html
```

### Step 2: 로그인하기 (1분)

1. **Auth Controller** 섹션을 펼치세요
2. **POST /api/auth/login**을 클릭
3. **Try it out** 버튼 클릭
4. 다음 내용을 복사해서 붙여넣기:
   ```json
   {
     "email": "admin@aris.com",
     "password": "admin1234"
   }
   ```
5. **Execute** 버튼 클릭
6. Response에서 `accessToken` 값을 복사 (긴 문자열)

### Step 3: 인증 설정하기 (1분)

1. Swagger UI 맨 위에 있는 **[Authorize]** 버튼 클릭
2. Value 입력란에 다음과 같이 입력:
   ```
   Bearer 복사한토큰
   ```
   예시:
   ```
   Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBhcmlzLmNvbSI...
   ```
3. **[Authorize]** 버튼 클릭
4. **[Close]** 버튼 클릭

✅ **이제 모든 API를 테스트할 수 있습니다!**

---

## 🎬 추천 테스트 시나리오

### 시나리오 1: 간단한 프로젝트 생성 (1분)

1. **Project Controller** 섹션 펼치기
2. **POST /api/projects** 클릭
3. **Try it out** 클릭
4. 다음 내용 붙여넣기:
   ```json
   {
     "code": "TEST001",
     "name": "테스트 프로젝트",
     "projectType": "SI",
     "startDate": "2025-01-01",
     "endDate": "2025-12-31",
     "companyId": 1
   }
   ```
5. **Execute** 클릭

✅ **결과 확인**: `201 Created` 응답과 함께 프로젝트 정보가 표시됩니다!

### 시나리오 2: SR 생성 및 자동 채번 확인 (2분)

1. **Service Request Controller** 섹션 펼치기
2. **POST /api/srs** 클릭
3. **Try it out** 클릭
4. 다음 내용 붙여넣기:
   ```json
   {
     "title": "로그인 기능 개발",
     "srType": "DEVELOPMENT",
     "srCategory": "AP_DEVELOPMENT",
     "businessRequirement": "소셜 로그인 기능이 필요합니다.",
     "projectId": 1,
     "requesterId": 1,
     "requestDate": "2025-01-15",
     "dueDate": "2025-02-15",
     "priority": "HIGH"
   }
   ```
5. **Execute** 클릭

✅ **핵심 확인사항**:
- `srNumber`: **SR2510-0001** 형식으로 자동 생성됨!
- `status`: **APPROVAL_REQUESTED** (승인 요청 상태)
- `id`: 1 (다음 단계에서 사용)

### 시나리오 3: 전체 프로세스 체험 (5분)

#### 3-1. 승인 요청 생성
1. **Approval Controller** 섹션 펼치기
2. **POST /api/approvals** 클릭
3. **Try it out** 클릭
4. 붙여넣기:
   ```json
   {
     "approvalType": "SR",
     "targetId": 1,
     "requesterId": 1,
     "approverIds": [1]
   }
   ```
5. **Execute** 클릭

✅ `approvalNumber`: **APP2510-0001** 생성 확인!

#### 3-2. 승인 처리
1. **PUT /api/approvals/{id}/approve** 클릭 (같은 섹션 내)
2. **Try it out** 클릭
3. `id` 입력란에 `1` 입력
4. Request body에 붙여넣기:
   ```json
   {
     "approverId": 1,
     "comment": "검토 완료. 승인합니다."
   }
   ```
5. **Execute** 클릭

✅ `status`: **APPROVED** 확인!

#### 3-3. SR 상태 변경
1. **Service Request Controller**로 이동
2. **PUT /api/srs/{id}/status** 클릭
3. **Try it out** 클릭
4. `id`: `1` 입력
5. `status`: `APPROVED` 선택 (드롭다운)
6. **Execute** 클릭

✅ SR 상태가 **APPROVED**로 변경됨!

#### 3-4. SPEC 생성
1. **Specification Controller** 섹션 펼치기
2. **POST /api/specs** 클릭
3. **Try it out** 클릭
4. 붙여넣기:
   ```json
   {
     "srId": 1,
     "specType": "DEVELOPMENT",
     "specCategory": "ACCEPTED",
     "functionPoint": 10.0,
     "manDay": 5.0,
     "assigneeId": 1,
     "reviewerId": 1
   }
   ```
5. **Execute** 클릭

✅ `specNumber`: **SPEC2510-0001** 생성 확인!  
✅ SR과 SPEC이 자동으로 연결됨!

---

## 📊 빠른 확인 명령어

### 데이터베이스에서 직접 확인
```bash
# PostgreSQL 접속
docker exec -it aris-postgres psql -U aris_user -d aris_db

# 프로젝트 확인
SELECT id, code, name, status FROM projects;

# SR 확인
SELECT id, sr_number, title, status FROM service_requests;

# SPEC 확인
SELECT id, spec_number, status FROM specifications;

# SR-SPEC 연결 확인
SELECT 
    sr.sr_number, 
    sr.title, 
    spec.spec_number 
FROM service_requests sr 
LEFT JOIN specifications spec ON sr.spec_id = spec.id;

# 종료
\q
```

### 애플리케이션 로그 확인
```bash
# 최근 로그 50줄 보기
docker logs aris-backend --tail 50

# 실시간 로그 보기
docker logs aris-backend -f
```

---

## 🎯 API 테스트 체크리스트

### 기본 기능
- [ ] 로그인 성공
- [ ] JWT 토큰 획득
- [ ] 프로젝트 생성
- [ ] SR 생성 (자동 채번 확인)
- [ ] SPEC 생성 (자동 채번 확인)
- [ ] 승인 요청 생성 (자동 채번 확인)

### 승인 프로세스
- [ ] 승인 처리 (PENDING → APPROVED)
- [ ] 반려 처리 (PENDING → REJECTED)
- [ ] 내가 승인할 대기 건 목록 조회
- [ ] 내가 요청한 승인 목록 조회

### 상태 관리
- [ ] SR 상태 변경
- [ ] SPEC 작업 시작 (PENDING → IN_PROGRESS)
- [ ] SPEC 작업 완료 (APPROVED → COMPLETED)
- [ ] 프로젝트 상태 변경

### 조회 기능
- [ ] SR 목록 조회 (페이징)
- [ ] SPEC 목록 조회 (필터링)
- [ ] 승인 목록 조회 (검색)
- [ ] SR 번호로 직접 조회
- [ ] SPEC 번호로 직접 조회

### 비즈니스 규칙
- [ ] 승인된 SR만 SPEC 생성 가능 (검증)
- [ ] 승인된 SR은 수정 불가 (검증)
- [ ] 현재 단계 승인자만 처리 가능 (검증)

---

## 💡 유용한 팁

### Swagger UI 활용법

1. **스키마 확인**: Response 예시에서 데이터 구조 확인 가능
2. **필수 필드**: 빨간색 별표(*)가 있는 필드는 필수
3. **드롭다운**: Enum 타입은 드롭다운으로 선택 가능
4. **Try it out**: 반드시 클릭해야 입력란이 활성화됨
5. **Clear**: 입력 내용을 초기화할 때 사용

### 자주 하는 실수

1. ❌ **Authorize 안 함** → 401 Unauthorized 오류
   ✅ 로그인 후 반드시 [Authorize] 버튼으로 토큰 설정!

2. ❌ **Try it out 안 누름** → Execute 버튼 안 보임
   ✅ Try it out을 먼저 클릭해야 입력 가능!

3. ❌ **Bearer 키워드 빠뜨림** → 401 오류
   ✅ `Bearer ` (공백 포함) + 토큰 전체를 입력!

4. ❌ **필수 필드 누락** → 400 Bad Request
   ✅ 빨간 별표(*) 필드는 반드시 입력!

5. ❌ **잘못된 ID 입력** → 404 Not Found
   ✅ 생성 시 받은 id 값을 정확히 입력!

---

## 🚨 문제 해결

### "401 Unauthorized" 오류
```
→ JWT 토큰이 설정되지 않았거나 만료됨
→ 해결: 다시 로그인하여 새 토큰 획득 후 Authorize
```

### "404 Not Found" 오류
```
→ 존재하지 않는 ID를 조회함
→ 해결: 목록 조회 API로 먼저 존재하는 ID 확인
```

### "400 Bad Request" 오류
```
→ 필수 필드 누락 또는 잘못된 형식
→ 해결: Response의 에러 메시지 확인
```

### Swagger UI 접속 안 됨
```bash
# 백엔드 재시작
docker restart aris-backend

# 로그 확인
docker logs aris-backend --tail 50
```

---

## 📚 더 자세한 문서

### 1. 상세 테스트 가이드
```
docs/Phase2_Testing_Guide.md
```
- 모든 API의 Request/Response 예시
- 단계별 테스트 절차
- 고급 테스트 시나리오

### 2. 개발 완료 문서
```
docs/Phase2_Complete.md
```
- 구현된 기능 전체 목록
- 아키텍처 설명
- 통계 및 메트릭스

### 3. 빠른 참조
```
docs/TEST_READY.md
```
- API 엔드포인트 전체 목록
- 시스템 상태 확인 방법
- Quick Reference

---

## 🎉 성공!

**Phase 2 테스트를 성공적으로 완료하셨습니다!**

모든 기능이 정상 동작하는지 확인했다면, 다음 단계로:
- **Phase 3 개발 시작**
- **통합 테스트 코드 작성**
- **프론트엔드 개발 시작**

---

**Happy Testing! 🚀**

Swagger UI: http://localhost:8080/swagger-ui.html  
계정: admin@aris.com / admin1234









