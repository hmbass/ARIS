package com.aris.domain.user.dto;

import com.aris.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 사용자 응답 DTO
 */
@Getter
@Builder
public class UserResponse {

    private Long id;
    private String email;
    private String name;
    private String phoneNumber;
    private String companyName;
    private String departmentName;
    private String employeeNumber;
    private String position;
    private Boolean isActive;
    private Boolean isApproved;
    private Boolean isLocked;
    private Boolean passwordChangeRequired;
    private List<String> roles;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .phoneNumber(user.getPhoneNumber())
                .companyName(user.getCompany() != null ? user.getCompany().getName() : null)
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : null)
                .employeeNumber(user.getEmployeeNumber())
                .position(user.getPosition())
                .isActive(user.getIsActive())
                .isApproved(user.getIsApproved())
                .isLocked(user.getIsLocked())
                .passwordChangeRequired(user.getPasswordChangeRequired())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName())
                        .collect(Collectors.toList()))
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}







