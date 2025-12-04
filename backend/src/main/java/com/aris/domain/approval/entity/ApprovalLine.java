package com.aris.domain.approval.entity;

import com.aris.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 승인라인 Entity
 */
@Entity
@Table(name = "approval_lines")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ApprovalLine {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approval_id", nullable = false)
    private Approval approval;
    
    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id", nullable = false)
    private User approver;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApprovalLineStatus status;
    
    @Column(columnDefinition = "TEXT")
    private String comment;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Builder
    public ApprovalLine(Approval approval, Integer stepOrder, User approver,
                        ApprovalLineStatus status, LocalDateTime createdAt) {
        this.approval = approval;
        this.stepOrder = stepOrder;
        this.approver = approver;
        this.status = status;
        this.createdAt = createdAt;
    }
    
    // Business Methods
    
    /**
     * 승인 처리
     */
    public void approve(String comment) {
        this.status = ApprovalLineStatus.APPROVED;
        this.comment = comment;
        this.approvedAt = LocalDateTime.now();
    }
    
    /**
     * 반려 처리
     */
    public void reject(String comment) {
        this.status = ApprovalLineStatus.REJECTED;
        this.comment = comment;
        this.approvedAt = LocalDateTime.now();
    }
    
    /**
     * 승인 완료 여부 확인
     */
    public boolean isApproved() {
        return this.status == ApprovalLineStatus.APPROVED;
    }
    
    /**
     * 반려 여부 확인
     */
    public boolean isRejected() {
        return this.status == ApprovalLineStatus.REJECTED;
    }
}









