package com.aris.domain.issue.dto;

import com.aris.domain.issue.entity.Issue;
import com.aris.domain.issue.entity.IssueStatus;
import com.aris.domain.issue.entity.IssueType;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 이슈 응답 DTO
 */
@Builder
public record IssueResponse(
        Long id,
        String issueNumber,
        Long srId,
        String srNumber,
        Long specId,
        String specNumber,
        Long projectId,
        String projectName,
        String title,
        String content,
        IssueType issueType,
        String priority,
        IssueStatus status,
        Long assigneeId,
        String assigneeName,
        Long reporterId,
        String reporterName,
        Long parentIssueId,
        String parentIssueNumber,
        LocalDateTime createdAt,
        String createdBy,
        LocalDateTime updatedAt,
        String updatedBy
) {
    public static IssueResponse from(Issue issue) {
        return IssueResponse.builder()
                .id(issue.getId())
                .issueNumber(issue.getIssueNumber())
                .srId(issue.getServiceRequest() != null ? issue.getServiceRequest().getId() : null)
                .srNumber(issue.getServiceRequest() != null ? issue.getServiceRequest().getSrNumber() : null)
                .specId(issue.getSpecification() != null ? issue.getSpecification().getId() : null)
                .specNumber(issue.getSpecification() != null ? issue.getSpecification().getSpecNumber() : null)
                .projectId(issue.getProject() != null ? issue.getProject().getId() : null)
                .projectName(issue.getProject() != null ? issue.getProject().getName() : null)
                .title(issue.getTitle())
                .content(issue.getContent())
                .issueType(issue.getIssueType())
                .priority(issue.getPriority())
                .status(issue.getStatus())
                .assigneeId(issue.getAssignee() != null ? issue.getAssignee().getId() : null)
                .assigneeName(issue.getAssignee() != null ? issue.getAssignee().getName() : null)
                .reporterId(issue.getReporter().getId())
                .reporterName(issue.getReporter().getName())
                .parentIssueId(issue.getParentIssue() != null ? issue.getParentIssue().getId() : null)
                .parentIssueNumber(issue.getParentIssue() != null ? issue.getParentIssue().getIssueNumber() : null)
                .createdAt(issue.getCreatedAt())
                .createdBy(issue.getCreatedBy())
                .updatedAt(issue.getUpdatedAt())
                .updatedBy(issue.getUpdatedBy())
                .build();
    }
}
