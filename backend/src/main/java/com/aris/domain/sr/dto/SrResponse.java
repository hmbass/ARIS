package com.aris.domain.sr.dto;

import com.aris.domain.sr.entity.ServiceRequest;
import com.aris.domain.sr.entity.SrCategory;
import com.aris.domain.sr.entity.SrStatus;
import com.aris.domain.sr.entity.SrType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * SR 응답 DTO
 */
@Getter
@Builder
public class SrResponse {
    
    private Long id;
    private String srNumber;
    private String title;
    private SrType srType;
    private SrCategory srCategory;
    private SrStatus status;
    private String businessRequirement;
    private String projectName;
    private String requesterName;
    private String requesterDeptName;
    private LocalDate requestDate;
    private LocalDate dueDate;
    private String priority;
    private LocalDate releaseDate;
    private String releaseNumber;
    private Long specId;
    private String specNumber;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    
    public static SrResponse from(ServiceRequest sr) {
        return SrResponse.builder()
                .id(sr.getId())
                .srNumber(sr.getSrNumber())
                .title(sr.getTitle())
                .srType(sr.getSrType())
                .srCategory(sr.getSrCategory())
                .status(sr.getStatus())
                .businessRequirement(sr.getBusinessRequirement())
                .projectName(sr.getProject() != null ? sr.getProject().getName() : null)
                .requesterName(sr.getRequester() != null ? sr.getRequester().getName() : null)
                .requesterDeptName(sr.getRequesterDept() != null ? sr.getRequesterDept().getName() : null)
                .requestDate(sr.getRequestDate())
                .dueDate(sr.getDueDate())
                .priority(sr.getPriority())
                .releaseDate(sr.getReleaseDate())
                .releaseNumber(sr.getReleaseNumber())
                .specId(sr.getSpecification() != null ? sr.getSpecification().getId() : null)
                .specNumber(sr.getSpecification() != null ? sr.getSpecification().getSpecNumber() : null)
                .createdAt(sr.getCreatedAt())
                .createdBy(sr.getCreatedBy())
                .updatedAt(sr.getUpdatedAt())
                .build();
    }
}









