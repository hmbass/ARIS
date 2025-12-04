package com.aris.domain.spec.entity;

import com.aris.domain.sr.entity.ServiceRequest;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * SPEC (Specification) Entity
 */
@Entity
@Table(name = "specifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Specification extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "spec_number", nullable = false, unique = true, length = 20)
    private String specNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sr_id", nullable = false)
    private ServiceRequest serviceRequest;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "spec_type", nullable = false, length = 20)
    private SpecType specType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "spec_category", nullable = false, length = 20)
    private SpecCategory specCategory;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SpecStatus status;
    
    @Column(name = "function_point", precision = 10, scale = 2)
    private BigDecimal functionPoint;
    
    @Column(name = "man_day", precision = 10, scale = 2)
    private BigDecimal manDay;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Builder
    public Specification(String specNumber, ServiceRequest serviceRequest, SpecType specType,
                         SpecCategory specCategory, SpecStatus status, BigDecimal functionPoint,
                         BigDecimal manDay, User assignee, User reviewer) {
        this.specNumber = specNumber;
        this.serviceRequest = serviceRequest;
        this.specType = specType;
        this.specCategory = specCategory;
        this.status = status;
        this.functionPoint = functionPoint;
        this.manDay = manDay;
        this.assignee = assignee;
        this.reviewer = reviewer;
    }
    
    // Business Methods
    
    /**
     * SPEC 정보 수정
     */
    public void updateInfo(BigDecimal functionPoint, BigDecimal manDay) {
        if (!status.isModifiable()) {
            throw new BusinessException(ErrorCode.SPEC_CANNOT_BE_MODIFIED);
        }
        this.functionPoint = functionPoint;
        this.manDay = manDay;
    }
    
    /**
     * 담당자 할당
     */
    public void assignTo(User assignee, User reviewer) {
        this.assignee = assignee;
        this.reviewer = reviewer;
    }
    
    /**
     * 작업 시작
     */
    public void startWork() {
        if (this.status == SpecStatus.PENDING) {
            this.status = SpecStatus.IN_PROGRESS;
            this.startedAt = LocalDateTime.now();
        }
    }
    
    /**
     * 작업 완료
     */
    public void complete() {
        if (this.status == SpecStatus.APPROVED) {
            this.status = SpecStatus.COMPLETED;
            this.completedAt = LocalDateTime.now();
        }
    }
    
    /**
     * SPEC 상태 변경
     */
    public void changeStatus(SpecStatus newStatus) {
        this.status = newStatus;
    }
    
    /**
     * 승인 요청 가능 여부 확인
     */
    public boolean canRequestApproval() {
        return status.canRequestApproval();
    }
    
    /**
     * 승인됨 여부 확인
     */
    public boolean isApproved() {
        return this.status == SpecStatus.APPROVED;
    }
}









