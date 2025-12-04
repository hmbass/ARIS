package com.aris.domain.incident.dto;

import com.aris.domain.incident.entity.IncidentType;
import com.aris.domain.incident.entity.Severity;
import com.aris.domain.incident.entity.SystemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record IncidentRequest(
        @NotBlank(message = "장애 제목은 필수입니다.")
        @Size(max = 200, message = "장애 제목은 200자를 초과할 수 없습니다.")
        String title,
        
        @NotNull(message = "장애 유형은 필수입니다.")
        IncidentType incidentType,
        
        @NotNull(message = "시스템 유형은 필수입니다.")
        SystemType systemType,
        
        String businessArea,
        
        @NotNull(message = "심각도는 필수입니다.")
        Severity severity,
        
        // occurredAt는 선택사항 (없으면 현재 시간 사용)
        LocalDateTime occurredAt,
        
        Long assigneeId
) {}





