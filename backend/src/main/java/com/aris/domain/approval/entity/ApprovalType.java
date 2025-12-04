package com.aris.domain.approval.entity;

import lombok.Getter;

/**
 * 승인 유형
 */
@Getter
public enum ApprovalType {
    
    SR("SR 승인"),
    SPEC("SPEC 승인"),
    RELEASE("릴리즈 승인"),
    DATA_EXTRACTION("데이터추출 승인");
    
    private final String description;
    
    ApprovalType(String description) {
        this.description = description;
    }
}







