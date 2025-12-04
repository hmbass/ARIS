package com.aris.domain.approval.entity;

import com.aris.domain.user.entity.User;
import com.aris.global.entity.BaseEntity;
import com.aris.global.exception.BusinessException;
import com.aris.global.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 승인 Entity
 */
@Entity
@Table(name = "approvals")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Approval extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "approval_number", nullable = false, unique = true, length = 20)
    private String approvalNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "approval_type", nullable = false, length = 20)
    private ApprovalType approvalType;
    
    @Column(name = "target_id", nullable = false)
    private Long targetId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApprovalStatus status;
    
    @Column(name = "current_step", nullable = false)
    private Integer currentStep;
    
    @Column(name = "total_steps", nullable = false)
    private Integer totalSteps;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;
    
    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @OneToMany(mappedBy = "approval", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApprovalLine> approvalLines = new ArrayList<>();
    
    @Builder
    public Approval(String approvalNumber, ApprovalType approvalType, Long targetId,
                    ApprovalStatus status, Integer currentStep, Integer totalSteps,
                    User requester, LocalDateTime requestedAt) {
        this.approvalNumber = approvalNumber;
        this.approvalType = approvalType;
        this.targetId = targetId;
        this.status = status;
        this.currentStep = currentStep;
        this.totalSteps = totalSteps;
        this.requester = requester;
        this.requestedAt = requestedAt;
    }
    
    // Business Methods
    
    /**
     * 승인라인 추가
     */
    public void addApprovalLine(ApprovalLine approvalLine) {
        this.approvalLines.add(approvalLine);
    }
    
    /**
     * 현재 승인자 확인
     */
    public ApprovalLine getCurrentApprovalLine() {
        return approvalLines.stream()
                .filter(line -> line.getStepOrder().equals(currentStep))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_APPROVAL_STEP));
    }
    
    /**
     * 승인 처리
     */
    public void approve(Long approverId, String comment) {
        if (status.isProcessed()) {
            throw new BusinessException(ErrorCode.APPROVAL_ALREADY_PROCESSED);
        }
        
        ApprovalLine currentLine = getCurrentApprovalLine();
        if (!currentLine.getApprover().getId().equals(approverId)) {
            throw new BusinessException(ErrorCode.NOT_APPROVAL_AUTHORITY);
        }
        
        currentLine.approve(comment);
        
        // 다음 단계로 진행 또는 승인 완료
        if (currentStep < totalSteps) {
            this.currentStep++;
        } else {
            this.status = ApprovalStatus.APPROVED;
            this.completedAt = LocalDateTime.now();
        }
    }
    
    /**
     * 반려 처리
     */
    public void reject(Long approverId, String comment) {
        if (status.isProcessed()) {
            throw new BusinessException(ErrorCode.APPROVAL_ALREADY_PROCESSED);
        }
        
        ApprovalLine currentLine = getCurrentApprovalLine();
        if (!currentLine.getApprover().getId().equals(approverId)) {
            throw new BusinessException(ErrorCode.NOT_APPROVAL_AUTHORITY);
        }
        
        currentLine.reject(comment);
        this.status = ApprovalStatus.REJECTED;
        this.completedAt = LocalDateTime.now();
    }
    
    /**
     * 승인 취소
     */
    public void cancel() {
        if (status.isProcessed()) {
            throw new BusinessException(ErrorCode.APPROVAL_ALREADY_PROCESSED);
        }
        this.status = ApprovalStatus.CANCELLED;
        this.completedAt = LocalDateTime.now();
    }
    
    /**
     * 승인 완료 여부 확인
     */
    public boolean isApproved() {
        return this.status == ApprovalStatus.APPROVED;
    }
    
    /**
     * 반려 여부 확인
     */
    public boolean isRejected() {
        return this.status == ApprovalStatus.REJECTED;
    }
}









