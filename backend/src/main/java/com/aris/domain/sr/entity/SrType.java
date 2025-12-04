package com.aris.domain.sr.entity;

import lombok.Getter;

/**
 * SR 유형
 */
@Getter
public enum SrType {
    
    DEVELOPMENT("개발"),
    OPERATION("운영");
    
    private final String description;
    
    SrType(String description) {
        this.description = description;
    }
}







