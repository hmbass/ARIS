package com.aris.domain.release.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 릴리즈 수정 요청 DTO
 */
@Builder
public record ReleaseUpdateRequest(
        @NotBlank(message = "릴리즈 제목은 필수입니다.")
        @Size(max = 200, message = "릴리즈 제목은 200자를 초과할 수 없습니다.")
        String title,
        
        String content,
        
        LocalDateTime scheduledAt
) {}


