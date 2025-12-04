package com.aris.domain.approval.dto;

import com.aris.domain.approval.entity.ApprovalLine;
import com.aris.domain.approval.entity.ApprovalLineStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 승인라인 응답 DTO
 */
@Getter
@Builder
public class ApprovalLineResponse {
    
    private Long id;
    private Integer stepOrder;
    private String approverName;
    private ApprovalLineStatus status;
    private String comment;
    private LocalDateTime approvedAt;
    
    public static ApprovalLineResponse from(ApprovalLine line) {
        return ApprovalLineResponse.builder()
                .id(line.getId())
                .stepOrder(line.getStepOrder())
                .approverName(line.getApprover() != null ? line.getApprover().getName() : null)
                .status(line.getStatus())
                .comment(line.getComment())
                .approvedAt(line.getApprovedAt())
                .build();
    }
}









