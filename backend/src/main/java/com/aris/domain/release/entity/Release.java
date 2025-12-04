package com.aris.domain.release.entity;

import com.aris.domain.company.entity.Department;
import com.aris.domain.user.entity.User;
import com.aris.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 릴리즈 Entity
 */
@Entity
@Table(name = "releases")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Release extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String releaseNumber;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReleaseType releaseType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReleaseStatus status = ReleaseStatus.REQUESTED;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_dept_id")
    private Department requesterDept;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id")
    private User approver;

    @Column
    private LocalDateTime scheduledAt;

    @Column
    private LocalDateTime deployedAt;

    /**
     * 릴리즈 수정
     */
    public void updateRelease(String title, String content, LocalDateTime scheduledAt) {
        this.title = title;
        this.content = content;
        this.scheduledAt = scheduledAt;
    }

    /**
     * 릴리즈 승인
     */
    public void approve(User approver) {
        this.status = ReleaseStatus.APPROVED;
        this.approver = approver;
    }

    /**
     * 릴리즈 배포
     */
    public void deploy() {
        this.status = ReleaseStatus.DEPLOYED;
        this.deployedAt = LocalDateTime.now();
    }

    /**
     * 릴리즈 취소
     */
    public void cancel() {
        this.status = ReleaseStatus.CANCELLED;
    }
}









