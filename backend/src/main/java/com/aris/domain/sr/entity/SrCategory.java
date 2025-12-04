package com.aris.domain.sr.entity;

import lombok.Getter;

/**
 * SR 분류
 */
@Getter
public enum SrCategory {
    
    // 개발 SR 분류
    AP_DEVELOPMENT("AP개발"),
    
    // 운영 SR 분류
    DATA_REQUEST("자료요청"),
    DATA_CHANGE_REQUEST("데이터변경요청"),
    DATA_VERIFICATION_REQUEST("데이터검증요청"),
    BUSINESS_SUPPORT_REQUEST("업무지원요청"),
    DATA_EXTRACTION_REQUEST("데이터추출요청"),
    REGULAR_OPERATION("정기업무");
    
    private final String description;
    
    SrCategory(String description) {
        this.description = description;
    }
}







