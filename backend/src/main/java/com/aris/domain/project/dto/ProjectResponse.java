package com.aris.domain.project.dto;

import com.aris.domain.project.entity.Project;
import com.aris.domain.project.entity.ProjectStatus;
import com.aris.domain.project.entity.ProjectType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 프로젝트 응답 DTO
 */
@Getter
@Builder
public class ProjectResponse {
    
    private Long id;
    private String code;
    private String name;
    private ProjectType projectType;
    private ProjectStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String companyName;
    private String description;
    private BigDecimal budget;
    private String pmName;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    
    public static ProjectResponse from(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .code(project.getCode())
                .name(project.getName())
                .projectType(project.getProjectType())
                .status(project.getStatus())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .companyName(project.getCompany() != null ? project.getCompany().getName() : null)
                .description(project.getDescription())
                .budget(project.getBudget())
                .pmName(project.getPm() != null ? project.getPm().getName() : null)
                .createdAt(project.getCreatedAt())
                .createdBy(project.getCreatedBy())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}









