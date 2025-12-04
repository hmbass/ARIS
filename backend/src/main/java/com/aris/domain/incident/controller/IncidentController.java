package com.aris.domain.incident.controller;

import com.aris.domain.incident.dto.IncidentRequest;
import com.aris.domain.incident.dto.IncidentResponse;
import com.aris.domain.incident.entity.IncidentStatus;
import com.aris.domain.incident.entity.Severity;
import com.aris.domain.incident.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@Tag(name = "Incident", description = "장애 관리 API")
public class IncidentController {
    
    private final IncidentService incidentService;
    
    @PostMapping
    @Operation(summary = "장애 등록", description = "새로운 장애를 등록합니다.")
    public ResponseEntity<IncidentResponse> createIncident(@Valid @RequestBody IncidentRequest request) {
        IncidentResponse response = incidentService.createIncident(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "장애 조회", description = "장애 ID로 상세 정보를 조회합니다.")
    public ResponseEntity<IncidentResponse> getIncident(@PathVariable Long id) {
        IncidentResponse response = incidentService.getIncident(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/number/{incidentNumber}")
    @Operation(summary = "장애 번호로 조회", description = "장애 번호로 상세 정보를 조회합니다.")
    public ResponseEntity<IncidentResponse> getIncidentByNumber(@PathVariable String incidentNumber) {
        IncidentResponse response = incidentService.getIncidentByNumber(incidentNumber);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "장애 목록 조회", description = "장애 목록을 페이징하여 조회합니다.")
    public ResponseEntity<Page<IncidentResponse>> getIncidents(
            @Parameter(description = "장애 제목") @RequestParam(required = false) String title,
            @Parameter(description = "장애 상태") @RequestParam(required = false) IncidentStatus status,
            @Parameter(description = "심각도") @RequestParam(required = false) Severity severity,
            @Parameter(description = "담당자 ID") @RequestParam(required = false) Long assigneeId,
            @Parameter(description = "발생 시작 시간") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime occurredStart,
            @Parameter(description = "발생 종료 시간") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime occurredEnd,
            @PageableDefault(size = 20, sort = "occurredAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<IncidentResponse> response = incidentService.getIncidents(title, status, severity, assigneeId, occurredStart, occurredEnd, pageable);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "장애 수정", description = "장애 정보를 수정합니다.")
    public ResponseEntity<IncidentResponse> updateIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentRequest request) {
        IncidentResponse response = incidentService.updateIncident(id, request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/resolve")
    @Operation(summary = "장애 해결", description = "장애를 해결 처리합니다.")
    public ResponseEntity<IncidentResponse> resolveIncident(
            @PathVariable Long id,
            @Parameter(description = "해결 내용") @RequestParam String resolution) {
        IncidentResponse response = incidentService.resolveIncident(id, resolution);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/close")
    @Operation(summary = "장애 종료", description = "장애를 종료 처리합니다.")
    public ResponseEntity<IncidentResponse> closeIncident(@PathVariable Long id) {
        IncidentResponse response = incidentService.closeIncident(id);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/assign")
    @Operation(summary = "장애 담당자 할당", description = "장애에 담당자를 할당합니다.")
    public ResponseEntity<IncidentResponse> assignIncident(
            @PathVariable Long id,
            @Parameter(description = "담당자 ID") @RequestParam Long assigneeId) {
        IncidentResponse response = incidentService.assignIncident(id, assigneeId);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "장애 삭제", description = "장애를 삭제합니다 (Soft Delete).")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
        incidentService.deleteIncident(id);
        return ResponseEntity.noContent().build();
    }
}









