package com.aris.domain.approval.entity;

import lombok.Getter;

/**
 * 승인라인 상태
 */
@Getter
public enum ApprovalLineStatus {
    
    PENDING("승인대기"),
    APPROVED("승인"),
    REJECTED("반려");
    
    private final String description;
    
    ApprovalLineStatus(String description) {
        this.description = description;
    }
}







