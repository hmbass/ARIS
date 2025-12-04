package com.aris.domain.release.dto;

import com.aris.domain.release.entity.ReleaseType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 릴리즈 등록/수정 요청 DTO
 */
@Builder
public record ReleaseRequest(
        @NotBlank(message = "릴리즈 제목은 필수입니다.")
        @Size(max = 200, message = "릴리즈 제목은 200자를 초과할 수 없습니다.")
        String title,
        
        @NotNull(message = "릴리즈 유형은 필수입니다.")
        ReleaseType releaseType,
        
        String content,
        
        // requesterId는 선택사항 (없으면 로그인한 사용자 사용)
        Long requesterId,
        
        Long requesterDeptId,
        
        LocalDateTime scheduledAt
) {}





