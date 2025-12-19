package com.aris.domain.issue.entity;

import lombok.Getter;

/**
 * 이슈 유형
 */
@Getter
public enum IssueType {
    
    BUG("버그"),
    IMPROVEMENT("개선"),
    NEW_FEATURE("신규기능"),
    TASK("작업");
    
    private final String description;
    
    IssueType(String description) {
        this.description = description;
    }
}


