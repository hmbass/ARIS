package com.aris.domain.project.dto;

import com.aris.domain.project.entity.ProjectStatus;
import com.aris.domain.project.entity.ProjectType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 프로젝트 등록/수정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class ProjectRequest {
    
    @NotBlank(message = "프로젝트 코드는 필수입니다.")
    @Size(max = 20, message = "프로젝트 코드는 20자 이내여야 합니다.")
    private String code;
    
    @NotBlank(message = "프로젝트명은 필수입니다.")
    @Size(max = 100, message = "프로젝트명은 100자 이내여야 합니다.")
    private String name;
    
    @NotNull(message = "프로젝트 유형은 필수입니다.")
    private ProjectType projectType;
    
    @NotNull(message = "시작일은 필수입니다.")
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    // companyId는 선택사항 (없으면 로그인한 사용자의 회사 사용)
    private Long companyId;
    
    private String description;
    
    private BigDecimal budget;
    
    private Long pmId;
}

