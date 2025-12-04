package com.aris.domain.approval.entity;

import lombok.Getter;

/**
 * 승인 상태
 */
@Getter
public enum ApprovalStatus {
    
    PENDING("승인대기"),
    APPROVED("승인완료"),
    REJECTED("반려"),
    CANCELLED("취소");
    
    private final String description;
    
    ApprovalStatus(String description) {
        this.description = description;
    }
    
    /**
     * 처리 완료된 상태인지 확인
     */
    public boolean isProcessed() {
        return this == APPROVED || this == REJECTED || this == CANCELLED;
    }
}







