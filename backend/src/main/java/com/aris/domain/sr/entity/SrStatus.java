package com.aris.domain.sr.entity;

import lombok.Getter;

/**
 * SR 상태
 */
@Getter
public enum SrStatus {
    
    APPROVAL_REQUESTED("승인요청"),
    APPROVAL_PENDING("승인대기"),
    APPROVED("승인"),
    REJECTED("반려"),
    CANCELLED("취소");
    
    private final String description;
    
    SrStatus(String description) {
        this.description = description;
    }
    
    /**
     * 수정 가능한 상태인지 확인
     */
    public boolean isModifiable() {
        return this == APPROVAL_REQUESTED || this == REJECTED;
    }
    
    /**
     * 승인 요청 가능한 상태인지 확인
     */
    public boolean canRequestApproval() {
        return this == APPROVAL_REQUESTED || this == REJECTED;
    }
}







