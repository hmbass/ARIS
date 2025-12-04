package com.aris.domain.spec.entity;

import lombok.Getter;

/**
 * SPEC 유형
 */
@Getter
public enum SpecType {
    
    DEVELOPMENT("개발"),
    OPERATION("운영");
    
    private final String description;
    
    SpecType(String description) {
        this.description = description;
    }
}







