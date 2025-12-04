package com.aris.domain.incident.entity;

import com.aris.domain.user.entity.User;
import com.aris.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 장애 Entity
 */
@Entity
@Table(name = "incidents")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Incident extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String incidentNumber;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IncidentType incidentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SystemType systemType;

    @Column(length = 50)
    private String businessArea;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private IncidentStatus status = IncidentStatus.OPEN;

    @Column(nullable = false)
    private LocalDateTime occurredAt;

    @Column
    private LocalDateTime resolvedAt;

    @Column(columnDefinition = "TEXT")
    private String resolution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    /**
     * 장애 수정
     */
    public void updateIncident(String title, SystemType systemType, String businessArea, Severity severity, User assignee) {
        this.title = title;
        this.systemType = systemType;
        this.businessArea = businessArea;
        this.severity = severity;
        this.assignee = assignee;
    }

    /**
     * 장애 해결
     */
    public void resolve(String resolution) {
        this.status = IncidentStatus.RESOLVED;
        this.resolution = resolution;
        this.resolvedAt = LocalDateTime.now();
    }

    /**
     * 장애 종료
     */
    public void close() {
        this.status = IncidentStatus.CLOSED;
    }

    /**
     * 담당자 할당
     */
    public void assignTo(User assignee) {
        this.assignee = assignee;
        if (this.status == IncidentStatus.OPEN) {
            this.status = IncidentStatus.IN_PROGRESS;
        }
    }
}







