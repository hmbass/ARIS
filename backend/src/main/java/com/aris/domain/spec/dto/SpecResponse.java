package com.aris.domain.spec.dto;

import com.aris.domain.spec.entity.Specification;
import com.aris.domain.spec.entity.SpecCategory;
import com.aris.domain.spec.entity.SpecStatus;
import com.aris.domain.spec.entity.SpecType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * SPEC 응답 DTO
 */
@Getter
@Builder
public class SpecResponse {
    
    private Long id;
    private String specNumber;
    private Long srId;
    private String srNumber;
    private SpecType specType;
    private SpecCategory specCategory;
    private SpecStatus status;
    private BigDecimal functionPoint;
    private BigDecimal manDay;
    private String assigneeName;
    private String reviewerName;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    
    public static SpecResponse from(Specification spec) {
        return SpecResponse.builder()
                .id(spec.getId())
                .specNumber(spec.getSpecNumber())
                .srId(spec.getServiceRequest() != null ? spec.getServiceRequest().getId() : null)
                .srNumber(spec.getServiceRequest() != null ? spec.getServiceRequest().getSrNumber() : null)
                .specType(spec.getSpecType())
                .specCategory(spec.getSpecCategory())
                .status(spec.getStatus())
                .functionPoint(spec.getFunctionPoint())
                .manDay(spec.getManDay())
                .assigneeName(spec.getAssignee() != null ? spec.getAssignee().getName() : null)
                .reviewerName(spec.getReviewer() != null ? spec.getReviewer().getName() : null)
                .startedAt(spec.getStartedAt())
                .completedAt(spec.getCompletedAt())
                .createdAt(spec.getCreatedAt())
                .createdBy(spec.getCreatedBy())
                .updatedAt(spec.getUpdatedAt())
                .build();
    }
}









