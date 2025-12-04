package com.aris.domain.project.entity;

import com.aris.domain.company.entity.Company;
import com.aris.domain.user.entity.User;
import com.aris.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 프로젝트 Entity
 */
@Entity
@Table(name = "projects")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Project extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 20)
    private String code;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "project_type", nullable = false, length = 20)
    private ProjectType projectType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProjectStatus status;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal budget;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pm_id")
    private User pm;
    
    @Builder
    public Project(String code, String name, ProjectType projectType, ProjectStatus status,
                   LocalDate startDate, LocalDate endDate, Company company,
                   String description, BigDecimal budget, User pm) {
        this.code = code;
        this.name = name;
        this.projectType = projectType;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.company = company;
        this.description = description;
        this.budget = budget;
        this.pm = pm;
    }
    
    // Business Methods
    
    /**
     * 프로젝트 정보 수정
     */
    public void updateInfo(String name, String description, LocalDate endDate, BigDecimal budget) {
        this.name = name;
        this.description = description;
        this.endDate = endDate;
        this.budget = budget;
    }
    
    /**
     * 프로젝트 상태 변경
     */
    public void changeStatus(ProjectStatus status) {
        this.status = status;
    }
    
    /**
     * PM 할당
     */
    public void assignPm(User pm) {
        this.pm = pm;
    }
    
    /**
     * 프로젝트 진행 중 여부 확인
     */
    public boolean isInProgress() {
        return this.status == ProjectStatus.IN_PROGRESS;
    }
    
    /**
     * 프로젝트 완료 여부 확인
     */
    public boolean isCompleted() {
        return this.status == ProjectStatus.COMPLETED;
    }
}









