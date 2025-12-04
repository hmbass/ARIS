package com.aris.domain.approval.dto;

import com.aris.domain.approval.entity.Approval;
import com.aris.domain.approval.entity.ApprovalStatus;
import com.aris.domain.approval.entity.ApprovalType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 승인 응답 DTO
 */
@Getter
@Builder
public class ApprovalResponse {
    
    private Long id;
    private String approvalNumber;
    private ApprovalType approvalType;
    private Long targetId;
    private ApprovalStatus status;
    private Integer currentStep;
    private Integer totalSteps;
    private String requesterName;
    private LocalDateTime requestedAt;
    private LocalDateTime completedAt;
    private List<ApprovalLineResponse> approvalLines;
    private LocalDateTime createdAt;
    
    public static ApprovalResponse from(Approval approval) {
        return ApprovalResponse.builder()
                .id(approval.getId())
                .approvalNumber(approval.getApprovalNumber())
                .approvalType(approval.getApprovalType())
                .targetId(approval.getTargetId())
                .status(approval.getStatus())
                .currentStep(approval.getCurrentStep())
                .totalSteps(approval.getTotalSteps())
                .requesterName(approval.getRequester() != null ? approval.getRequester().getName() : null)
                .requestedAt(approval.getRequestedAt())
                .completedAt(approval.getCompletedAt())
                .approvalLines(approval.getApprovalLines().stream()
                        .map(ApprovalLineResponse::from)
                        .collect(Collectors.toList()))
                .createdAt(approval.getCreatedAt())
                .build();
    }
}









