-- =====================================================
-- V4.0.0: 불필요한 NOT NULL 제약조건 제거
-- 작성일: 2025-01-16
-- 설명: 사용자 친화적 UX를 위해 자동 설정 가능한 필드들의 NOT NULL 제약조건 제거
-- =====================================================

-- SR (Service Request) 테이블
ALTER TABLE service_requests
    ALTER COLUMN sr_category DROP NOT NULL,
    ALTER COLUMN business_requirement DROP NOT NULL;

-- 주석 추가
COMMENT ON COLUMN service_requests.sr_category IS 'SR 분류 (선택사항, srType에 따라 자동 설정 가능)';
COMMENT ON COLUMN service_requests.business_requirement IS '비즈니스 요구사항 (선택사항)';
COMMENT ON COLUMN service_requests.request_date IS '요청일 (선택사항, 기본값: 오늘)';



