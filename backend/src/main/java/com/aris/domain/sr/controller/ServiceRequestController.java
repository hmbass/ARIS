package com.aris.domain.sr.controller;

import com.aris.domain.sr.dto.SrCreateRequest;
import com.aris.domain.sr.dto.SrResponse;
import com.aris.domain.sr.dto.SrUpdateRequest;
import com.aris.domain.sr.entity.SrStatus;
import com.aris.domain.sr.entity.SrType;
import com.aris.domain.sr.service.ServiceRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * SR Controller
 */
@RestController
@RequestMapping("/api/srs")
@RequiredArgsConstructor
@Tag(name = "ServiceRequest", description = "SR 관리 API")
public class ServiceRequestController {
    
    private final ServiceRequestService serviceRequestService;
    
    @PostMapping
    @Operation(summary = "SR 등록", description = "새로운 SR을 등록합니다.")
    public ResponseEntity<SrResponse> createServiceRequest(
            @Valid @RequestBody SrCreateRequest request) {
        SrResponse response = serviceRequestService.createServiceRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "SR 조회", description = "SR 상세 정보를 조회합니다.")
    public ResponseEntity<SrResponse> getServiceRequest(@PathVariable Long id) {
        SrResponse response = serviceRequestService.getServiceRequest(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/number/{srNumber}")
    @Operation(summary = "SR 번호로 조회", description = "SR 번호로 상세 정보를 조회합니다.")
    public ResponseEntity<SrResponse> getServiceRequestByNumber(@PathVariable String srNumber) {
        SrResponse response = serviceRequestService.getServiceRequestByNumber(srNumber);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "SR 목록 조회", description = "SR 목록을 검색 및 필터링하여 조회합니다.")
    public ResponseEntity<Page<SrResponse>> searchServiceRequests(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) SrType srType,
            @RequestParam(required = false) SrStatus status,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long requesterId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @PageableDefault(size = 20, sort = "requestDate", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<SrResponse> response = serviceRequestService.searchServiceRequests(
                title, srType, status, projectId, requesterId, startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "SR 수정", description = "SR 정보를 수정합니다.")
    public ResponseEntity<SrResponse> updateServiceRequest(
            @PathVariable Long id,
            @Valid @RequestBody SrUpdateRequest request) {
        SrResponse response = serviceRequestService.updateServiceRequest(id, request);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/status")
    @Operation(summary = "SR 상태 변경", description = "SR 상태를 변경합니다.")
    public ResponseEntity<SrResponse> changeStatus(
            @PathVariable Long id,
            @RequestParam SrStatus status) {
        SrResponse response = serviceRequestService.changeStatus(id, status);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "SR 삭제", description = "SR을 삭제합니다 (Soft Delete).")
    public ResponseEntity<Void> deleteServiceRequest(@PathVariable Long id) {
        serviceRequestService.deleteServiceRequest(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/count")
    @Operation(summary = "SR 개수 조회", description = "사용자 권한에 따른 SR 개수를 조회합니다.")
    public ResponseEntity<Long> countServiceRequests() {
        long count = serviceRequestService.countUserServiceRequests();
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/approvable")
    @Operation(summary = "승인 요청 가능한 SR 목록 조회", description = "승인 요청 가능한 SR 목록을 조회합니다.")
    public ResponseEntity<java.util.List<SrResponse>> getApprovableSrs() {
        java.util.List<SrResponse> response = serviceRequestService.getApprovableSrs();
        return ResponseEntity.ok(response);
    }
}









