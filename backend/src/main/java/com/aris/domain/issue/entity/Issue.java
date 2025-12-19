package com.aris.domain.issue.entity;

import com.aris.domain.project.entity.Project;
import com.aris.domain.sr.entity.ServiceRequest;
import com.aris.domain.spec.entity.Specification;
import com.aris.domain.user.entity.User;
import com.aris.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * 이슈 Entity
 */
@Entity
@Table(name = "issues")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Issue extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String issueNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sr_id")
    private ServiceRequest serviceRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spec_id")
    private Specification specification;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "issue_type", length = 20)
    @Builder.Default
    private IssueType issueType = IssueType.BUG;
    
    @Column(length = 20)
    @Builder.Default
    private String priority = "MEDIUM";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private IssueStatus status = IssueStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_issue_id")
    private Issue parentIssue;

    /**
     * 이슈 수정
     */
    public void updateIssue(String title, String content, User assignee) {
        this.title = title;
        this.content = content;
        this.assignee = assignee;
    }

    /**
     * 이슈 상태 변경
     */
    public void updateStatus(IssueStatus status) {
        this.status = status;
    }
    
    /**
     * 이슈 유형 변경
     */
    public void updateIssueType(IssueType issueType) {
        this.issueType = issueType;
    }
    
    /**
     * 우선순위 변경
     */
    public void updatePriority(String priority) {
        this.priority = priority;
    }

    /**
     * 담당자 할당
     */
    public void assignTo(User assignee) {
        this.assignee = assignee;
    }
}
