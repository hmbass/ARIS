package com.aris.domain.incident.dto;

import com.aris.domain.incident.entity.Incident;
import com.aris.domain.incident.entity.IncidentStatus;
import com.aris.domain.incident.entity.IncidentType;
import com.aris.domain.incident.entity.Severity;
import com.aris.domain.incident.entity.SystemType;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record IncidentResponse(
        Long id,
        String incidentNumber,
        String title,
        IncidentType incidentType,
        SystemType systemType,
        String businessArea,
        Severity severity,
        IncidentStatus status,
        LocalDateTime occurredAt,
        LocalDateTime resolvedAt,
        String resolution,
        Long assigneeId,
        String assigneeName,
        LocalDateTime createdAt,
        String createdBy,
        LocalDateTime updatedAt,
        String updatedBy
) {
    public static IncidentResponse from(Incident incident) {
        return IncidentResponse.builder()
                .id(incident.getId())
                .incidentNumber(incident.getIncidentNumber())
                .title(incident.getTitle())
                .incidentType(incident.getIncidentType())
                .systemType(incident.getSystemType())
                .businessArea(incident.getBusinessArea())
                .severity(incident.getSeverity())
                .status(incident.getStatus())
                .occurredAt(incident.getOccurredAt())
                .resolvedAt(incident.getResolvedAt())
                .resolution(incident.getResolution())
                .assigneeId(incident.getAssignee() != null ? incident.getAssignee().getId() : null)
                .assigneeName(incident.getAssignee() != null ? incident.getAssignee().getName() : null)
                .createdAt(incident.getCreatedAt())
                .createdBy(incident.getCreatedBy())
                .updatedAt(incident.getUpdatedAt())
                .updatedBy(incident.getUpdatedBy())
                .build();
    }
}









