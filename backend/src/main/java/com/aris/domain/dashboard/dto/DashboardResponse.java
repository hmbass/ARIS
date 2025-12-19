package com.aris.domain.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 대시보드 응답 DTO
 */
@Getter
@Builder
public class DashboardResponse {
    
    private List<ProjectProgress> projectProgresses;
    private List<RecentActivity> recentActivities;
    
    @Getter
    @Builder
    public static class ProjectProgress {
        private Long projectId;
        private String projectName;
        private int progress;
        private String color;
    }
    
    @Getter
    @Builder
    public static class RecentActivity {
        private Long id;
        private String type;
        private String title;
        private String user;
        private String time;
        private String path;
    }
}


