-- 이슈 테이블에 유형, 우선순위, 프로젝트 필드 추가
ALTER TABLE issues ADD COLUMN issue_type VARCHAR(20);
ALTER TABLE issues ADD COLUMN priority VARCHAR(20);
ALTER TABLE issues ADD COLUMN project_id BIGINT REFERENCES projects(id);

-- 기존 데이터에 기본값 설정
UPDATE issues SET issue_type = 'BUG' WHERE issue_type IS NULL;
UPDATE issues SET priority = 'MEDIUM' WHERE priority IS NULL;

-- 인덱스 추가
CREATE INDEX idx_issue_type ON issues(issue_type);
CREATE INDEX idx_issue_priority ON issues(priority);
CREATE INDEX idx_issue_project ON issues(project_id);

COMMENT ON COLUMN issues.issue_type IS 'BUG: 버그, IMPROVEMENT: 개선, NEW_FEATURE: 신규기능, TASK: 작업';
COMMENT ON COLUMN issues.priority IS 'LOW: 낮음, MEDIUM: 보통, HIGH: 높음, CRITICAL: 긴급';
