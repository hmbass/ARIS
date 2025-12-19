package com.aris.domain.dashboard.service;

import com.aris.domain.approval.entity.Approval;
import com.aris.domain.approval.repository.ApprovalRepository;
import com.aris.domain.dashboard.dto.DashboardResponse;
import com.aris.domain.issue.entity.Issue;
import com.aris.domain.issue.repository.IssueRepository;
import com.aris.domain.project.entity.Project;
import com.aris.domain.project.repository.ProjectRepository;
import com.aris.domain.spec.entity.Specification;
import com.aris.domain.spec.repository.SpecificationRepository;
import com.aris.domain.sr.entity.ServiceRequest;
import com.aris.domain.sr.repository.ServiceRequestRepository;
import com.aris.domain.user.entity.User;
import com.aris.domain.user.repository.UserRepository;
import com.aris.global.exception.BusinessException;
import com.aris.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 대시보드 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final SpecificationRepository specificationRepository;
    private final ApprovalRepository approvalRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    
    private static final String[] COLORS = {"#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"};

    /**
     * 대시보드 데이터 조회 (현재 로그인 사용자 기준)
     */
    public DashboardResponse getDashboardData() {
        User currentUser = getCurrentUser();
        
        List<DashboardResponse.ProjectProgress> projectProgresses = getProjectProgresses(currentUser);
        List<DashboardResponse.RecentActivity> recentActivities = getRecentActivities(currentUser);
        
        return DashboardResponse.builder()
                .projectProgresses(projectProgresses)
                .recentActivities(recentActivities)
                .build();
    }
    
    /**
     * 프로젝트 진행률 조회
     * - 내가 PM인 프로젝트 또는 내가 요청한 SR이 있는 프로젝트
     */
    private List<DashboardResponse.ProjectProgress> getProjectProgresses(User currentUser) {
        List<DashboardResponse.ProjectProgress> progresses = new ArrayList<>();
        
        // PM이 나인 프로젝트 조회
        List<Project> myProjects = projectRepository.findByPmId(currentUser.getId());
        
        int colorIndex = 0;
        for (Project project : myProjects) {
            if (project.getDeletedAt() != null) continue;
            
            int progress = calculateProjectProgress(project);
            progresses.add(DashboardResponse.ProjectProgress.builder()
                    .projectId(project.getId())
                    .projectName(project.getName())
                    .progress(progress)
                    .color(COLORS[colorIndex % COLORS.length])
                    .build());
            colorIndex++;
            
            if (progresses.size() >= 4) break; // 최대 4개
        }
        
        return progresses;
    }
    
    /**
     * 프로젝트 진행률 계산
     * - 완료된 SR / 전체 SR * 100
     */
    private int calculateProjectProgress(Project project) {
        List<ServiceRequest> srs = serviceRequestRepository.findByProjectId(project.getId());
        if (srs.isEmpty()) return 0;
        
        long totalSrs = srs.stream().filter(sr -> sr.getDeletedAt() == null).count();
        if (totalSrs == 0) return 0;
        
        long completedSrs = srs.stream()
                .filter(sr -> sr.getDeletedAt() == null)
                .filter(sr -> sr.getStatus() != null && 
                        (sr.getStatus().name().equals("COMPLETED") || 
                         sr.getStatus().name().equals("CLOSED") ||
                         sr.getStatus().name().equals("APPROVED")))
                .count();
        
        return (int) Math.round((double) completedSrs / totalSrs * 100);
    }
    
    /**
     * 최근 활동 조회
     * - 내가 생성/요청한 SR, SPEC, 승인, 이슈 등
     */
    private List<DashboardResponse.RecentActivity> getRecentActivities(User currentUser) {
        List<DashboardResponse.RecentActivity> activities = new ArrayList<>();
        
        // 최근 SR
        var recentSrs = serviceRequestRepository.findRecentByRequesterId(
                currentUser.getId(), 
                PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "createdAt")));
        for (ServiceRequest sr : recentSrs) {
            activities.add(DashboardResponse.RecentActivity.builder()
                    .id(sr.getId())
                    .type("SR")
                    .title(sr.getTitle())
                    .user(sr.getRequester() != null ? sr.getRequester().getName() : "-")
                    .time(formatRelativeTime(sr.getCreatedAt()))
                    .path("/srs/" + sr.getId())
                    .build());
        }
        
        // 최근 SPEC (담당자가 나인 경우)
        var recentSpecs = specificationRepository.findRecentByAssigneeId(
                currentUser.getId(),
                PageRequest.of(0, 2, Sort.by(Sort.Direction.DESC, "createdAt")));
        for (Specification spec : recentSpecs) {
            activities.add(DashboardResponse.RecentActivity.builder()
                    .id(spec.getId())
                    .type("SPEC")
                    .title(spec.getSpecNumber())
                    .user(spec.getAssignee() != null ? spec.getAssignee().getName() : "-")
                    .time(formatRelativeTime(spec.getCreatedAt()))
                    .path("/specs/" + spec.getId())
                    .build());
        }
        
        // 최근 승인 요청 (요청자가 나인 경우)
        var recentApprovals = approvalRepository.findRecentByRequesterId(
                currentUser.getId(),
                PageRequest.of(0, 2, Sort.by(Sort.Direction.DESC, "createdAt")));
        for (Approval approval : recentApprovals) {
            String title = approval.getApprovalNumber() + " (" + getApprovalTypeLabel(approval.getApprovalType()) + ")";
            activities.add(DashboardResponse.RecentActivity.builder()
                    .id(approval.getId())
                    .type("승인")
                    .title(title)
                    .user(approval.getRequester() != null ? approval.getRequester().getName() : "-")
                    .time(formatRelativeTime(approval.getCreatedAt()))
                    .path("/approvals/" + approval.getId())
                    .build());
        }
        
        // 최근 이슈 (보고자가 나인 경우)
        var recentIssues = issueRepository.findRecentByReporterId(
                currentUser.getId(),
                PageRequest.of(0, 2, Sort.by(Sort.Direction.DESC, "createdAt")));
        for (Issue issue : recentIssues) {
            activities.add(DashboardResponse.RecentActivity.builder()
                    .id(issue.getId())
                    .type("이슈")
                    .title(issue.getTitle())
                    .user(issue.getReporter() != null ? issue.getReporter().getName() : "-")
                    .time(formatRelativeTime(issue.getCreatedAt()))
                    .path("/issues/" + issue.getId())
                    .build());
        }
        
        // 시간 순으로 정렬 후 최대 6개 반환
        activities.sort((a, b) -> {
            // 시간 문자열 비교 (분 전 < 시간 전 < 일 전)
            return compareTimeStrings(a.getTime(), b.getTime());
        });
        
        return activities.stream().limit(6).toList();
    }
    
    /**
     * 상대적 시간 포맷
     */
    private String formatRelativeTime(LocalDateTime dateTime) {
        if (dateTime == null) return "-";
        
        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        long minutes = duration.toMinutes();
        long hours = duration.toHours();
        long days = duration.toDays();
        
        if (minutes < 1) return "방금 전";
        if (minutes < 60) return minutes + "분 전";
        if (hours < 24) return hours + "시간 전";
        if (days < 30) return days + "일 전";
        
        return dateTime.toLocalDate().toString();
    }
    
    /**
     * 시간 문자열 비교 (정렬용)
     */
    private int compareTimeStrings(String a, String b) {
        int aValue = parseTimeValue(a);
        int bValue = parseTimeValue(b);
        return Integer.compare(aValue, bValue);
    }
    
    private int parseTimeValue(String time) {
        if (time.contains("방금")) return 0;
        if (time.contains("분")) {
            try {
                return Integer.parseInt(time.replaceAll("[^0-9]", ""));
            } catch (NumberFormatException e) {
                return 0;
            }
        }
        if (time.contains("시간")) {
            try {
                return Integer.parseInt(time.replaceAll("[^0-9]", "")) * 60;
            } catch (NumberFormatException e) {
                return 60;
            }
        }
        if (time.contains("일")) {
            try {
                return Integer.parseInt(time.replaceAll("[^0-9]", "")) * 60 * 24;
            } catch (NumberFormatException e) {
                return 60 * 24;
            }
        }
        return Integer.MAX_VALUE;
    }
    
    /**
     * 승인 유형 라벨
     */
    private String getApprovalTypeLabel(com.aris.domain.approval.entity.ApprovalType type) {
        if (type == null) return "-";
        return type.getDescription();
    }
    
    /**
     * 현재 로그인 사용자 조회
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}


