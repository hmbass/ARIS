package com.aris.domain.incident.service;

import com.aris.domain.incident.dto.IncidentRequest;
import com.aris.domain.incident.dto.IncidentResponse;
import com.aris.domain.incident.entity.Incident;
import com.aris.domain.incident.entity.IncidentStatus;
import com.aris.domain.incident.entity.Severity;
import com.aris.domain.incident.repository.IncidentRepository;
import com.aris.domain.user.repository.UserRepository;
import com.aris.global.common.service.NumberingService;
import com.aris.global.exception.BusinessException;
import com.aris.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class IncidentService {
    
    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final NumberingService numberingService;
    
    @Transactional
    public IncidentResponse createIncident(IncidentRequest request) {
        String incidentNumber = numberingService.generateIncidentNumber();
        
        var incidentBuilder = Incident.builder()
                .incidentNumber(incidentNumber)
                .title(request.title())
                .incidentType(request.incidentType())
                .systemType(request.systemType())
                .businessArea(request.businessArea())
                .severity(request.severity())
                .occurredAt(request.occurredAt());
        
        if (request.assigneeId() != null) {
            var assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
            incidentBuilder.assignee(assignee);
        }
        
        Incident incident = incidentBuilder.build();
        Incident savedIncident = incidentRepository.save(incident);
        
        log.info("장애 생성 완료: {}", savedIncident.getIncidentNumber());
        return IncidentResponse.from(savedIncident);
    }
    
    public IncidentResponse getIncident(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.INCIDENT_NOT_FOUND));
        return IncidentResponse.from(incident);
    }
    
    public IncidentResponse getIncidentByNumber(String incidentNumber) {
        Incident incident = incidentRepository.findByIncidentNumber(incidentNumber)
                .orElseThrow(() -> new BusinessException(ErrorCode.INCIDENT_NOT_FOUND));
        return IncidentResponse.from(incident);
    }
    
    public Page<IncidentResponse> getIncidents(String title, IncidentStatus status, Severity severity, 
                                               Long assigneeId, LocalDateTime occurredStart, 
                                               LocalDateTime occurredEnd, Pageable pageable) {
        // 모든 필터가 null이면 기본 findAll 사용 (PostgreSQL Enum 타입 이슈 우회)
        if (title == null && status == null && severity == null && assigneeId == null && occurredStart == null && occurredEnd == null) {
            return incidentRepository.findAll(pageable).map(IncidentResponse::from);
        }
        
        return incidentRepository.search(title, status, severity, assigneeId, occurredStart, occurredEnd, pageable)
                .map(IncidentResponse::from);
    }
    
    @Transactional
    public IncidentResponse updateIncident(Long id, IncidentRequest request) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.INCIDENT_NOT_FOUND));
        
        var assignee = request.assigneeId() != null
                ? userRepository.findById(request.assigneeId())
                        .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND))
                : null;
        
        incident.updateIncident(request.title(), request.systemType(), request.businessArea(), 
                               request.severity(), assignee);
        
        log.info("장애 수정 완료: {}", incident.getIncidentNumber());
        return IncidentResponse.from(incident);
    }
    
    @Transactional
    public IncidentResponse resolveIncident(Long id, String resolution) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.INCIDENT_NOT_FOUND));
        
        incident.resolve(resolution);
        
        log.info("장애 해결 완료: {}", incident.getIncidentNumber());
        return IncidentResponse.from(incident);
    }
    
    @Transactional
    public IncidentResponse closeIncident(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.INCIDENT_NOT_FOUND));
        
        incident.close();
        
        log.info("장애 종료 완료: {}", incident.getIncidentNumber());
        return IncidentResponse.from(incident);
    }
    
    @Transactional
    public IncidentResponse assignIncident(Long id, Long assigneeId) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.INCIDENT_NOT_FOUND));
        
        var assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        
        incident.assignTo(assignee);
        
        log.info("장애 담당자 할당: {} -> {}", incident.getIncidentNumber(), assignee.getName());
        return IncidentResponse.from(incident);
    }
    
    @Transactional
    public void deleteIncident(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.INCIDENT_NOT_FOUND));
        
        incident.delete();
        
        log.info("장애 삭제 완료: {}", incident.getIncidentNumber());
    }
}



