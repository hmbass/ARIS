package com.aris.domain.sr.entity;

import com.aris.domain.company.entity.Department;
import com.aris.domain.project.entity.Project;
import com.aris.domain.spec.entity.Specification;
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

import java.time.LocalDate;

/**
 * SR (Service Request) Entity
 */
@Entity
@Table(name = "service_requests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class ServiceRequest extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "sr_number", nullable = false, unique = true, length = 20)
    private String srNumber;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "sr_type", nullable = false, length = 20)
    private SrType srType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "sr_category", nullable = false, length = 50)
    private SrCategory srCategory;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SrStatus status;
    
    @Column(name = "business_requirement", nullable = false, columnDefinition = "TEXT")
    private String businessRequirement;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_dept_id")
    private Department requesterDept;
    
    @Column(name = "request_date", nullable = false)
    private LocalDate requestDate;
    
    @Column(name = "due_date")
    private LocalDate dueDate;
    
    @Column(length = 20)
    private String priority;
    
    @Column(name = "release_date")
    private LocalDate releaseDate;
    
    @Column(name = "release_number", length = 50)
    private String releaseNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spec_id")
    private Specification specification;
    
    @Builder
    public ServiceRequest(String srNumber, String title, SrType srType, SrCategory srCategory,
                          SrStatus status, String businessRequirement, Project project,
                          User requester, Department requesterDept, LocalDate requestDate,
                          LocalDate dueDate, String priority) {
        this.srNumber = srNumber;
        this.title = title;
        this.srType = srType;
        this.srCategory = srCategory;
        this.status = status;
        this.businessRequirement = businessRequirement;
        this.project = project;
        this.requester = requester;
        this.requesterDept = requesterDept;
        this.requestDate = requestDate;
        this.dueDate = dueDate;
        this.priority = priority;
    }
    
    // Business Methods
    
    /**
     * SR 정보 수정
     */
    public void updateInfo(String title, String businessRequirement, LocalDate dueDate, String priority) {
        if (!status.isModifiable()) {
            throw new BusinessException(ErrorCode.SR_CANNOT_BE_MODIFIED);
        }
        this.title = title;
        this.businessRequirement = businessRequirement;
        this.dueDate = dueDate;
        this.priority = priority;
    }
    
    /**
     * SR 상태 변경
     */
    public void changeStatus(SrStatus newStatus) {
        this.status = newStatus;
    }
    
    /**
     * 릴리즈 정보 설정
     */
    public void setReleaseInfo(LocalDate releaseDate, String releaseNumber) {
        this.releaseDate = releaseDate;
        this.releaseNumber = releaseNumber;
    }
    
    /**
     * SPEC 연결
     */
    public void linkSpecification(Specification specification) {
        if (this.status != SrStatus.APPROVED) {
            throw new BusinessException(ErrorCode.SPEC_CANNOT_BE_CREATED);
        }
        this.specification = specification;
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
        return this.status == SrStatus.APPROVED;
    }
}









