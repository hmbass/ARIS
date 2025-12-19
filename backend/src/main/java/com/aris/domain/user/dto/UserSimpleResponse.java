package com.aris.domain.user.dto;

import com.aris.domain.user.entity.User;
import lombok.Builder;

/**
 * 사용자 간소화 응답 DTO (담당자 선택용)
 */
@Builder
public record UserSimpleResponse(
        Long id,
        String name,
        String email,
        String departmentName
) {
    public static UserSimpleResponse from(User user) {
        return UserSimpleResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : null)
                .build();
    }
}


