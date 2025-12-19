package com.aris.domain.issue.dto;

import com.aris.domain.issue.entity.IssueType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

/**
 * 이슈 등록/수정 요청 DTO
 */
@Builder
public record IssueRequest(
        Long srId,
        
        Long specId,
        
        Long projectId,
        
        @NotBlank(message = "이슈 제목은 필수입니다.")
        @Size(max = 200, message = "이슈 제목은 200자를 초과할 수 없습니다.")
        String title,
        
        @NotBlank(message = "이슈 내용은 필수입니다.")
        String content,
        
        IssueType issueType,
        
        String priority,
        
        Long assigneeId,
        
        // reporterId는 선택사항 (없으면 로그인한 사용자 사용)
        Long reporterId,
        
        Long parentIssueId
) {}
