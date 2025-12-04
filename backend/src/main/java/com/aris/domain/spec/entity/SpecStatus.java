package com.aris.domain.spec.entity;

import lombok.Getter;

/**
 * SPEC 상태
 */
@Getter
public enum SpecStatus {
    
    PENDING("대기"),
    IN_PROGRESS("진행중"),
    APPROVAL_PENDING("승인대기"),
    APPROVED("승인"),
    REJECTED("반려"),
    COMPLETED("완료");
    
    private final String description;
    
    SpecStatus(String description) {
        this.description = description;
    }
    
    /**
     * 수정 가능한 상태인지 확인
     */
    public boolean isModifiable() {
        return this == PENDING || this == IN_PROGRESS || this == REJECTED;
    }
    
    /**
     * 승인 요청 가능한 상태인지 확인
     */
    public boolean canRequestApproval() {
        return this == IN_PROGRESS;
    }
}







