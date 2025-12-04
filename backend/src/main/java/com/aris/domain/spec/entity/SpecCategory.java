package com.aris.domain.spec.entity;

import lombok.Getter;

/**
 * SPEC 분류
 */
@Getter
public enum SpecCategory {
    
    ACCEPTED("접수"),
    CANCELLED("취소");
    
    private final String description;
    
    SpecCategory(String description) {
        this.description = description;
    }
}







