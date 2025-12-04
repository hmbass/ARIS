package com.aris.domain.project.entity;

import lombok.Getter;

/**
 * 프로젝트 상태
 */
@Getter
public enum ProjectStatus {
    
    PREPARING("준비중"),
    IN_PROGRESS("진행중"),
    COMPLETED("완료"),
    CANCELLED("취소");
    
    private final String description;
    
    ProjectStatus(String description) {
        this.description = description;
    }
}







