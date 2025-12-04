package com.aris.domain.project.entity;

import lombok.Getter;

/**
 * 프로젝트 유형
 */
@Getter
public enum ProjectType {
    
    SI("System Integration", "시스템 통합"),
    SM("System Maintenance", "시스템 유지보수");
    
    private final String code;
    private final String description;
    
    ProjectType(String code, String description) {
        this.code = code;
        this.description = description;
    }
}







