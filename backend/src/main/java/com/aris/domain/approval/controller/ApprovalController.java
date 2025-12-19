package com.aris.domain.approval.controller;

import com.aris.domain.approval.dto.ApprovalProcessRequest;
import com.aris.domain.approval.dto.ApprovalRequest;
import com.aris.domain.approval.dto.ApprovalResponse;
import com.aris.domain.approval.entity.ApprovalStatus;
import com.aris.domain.approval.entity.ApprovalType;
import com.aris.domain.approval.service.ApprovalService;
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

import java.util.List;

/**
 * 승인 Controller
 */
@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
@Tag(name = "Approval", description = "승인 관리 API")
public class ApprovalController {
    
    private final ApprovalService approvalService;
    
    @PostMapping
    @Operation(summary = "승인 요청 생성", description = "새로운 승인 요청을 생성합니다.")
    public ResponseEntity<ApprovalResponse> createApproval(
            @Valid @RequestBody ApprovalRequest request) {
        ApprovalResponse response = approvalService.createApproval(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "승인 조회", description = "승인 상세 정보를 조회합니다.")
    public ResponseEntity<ApprovalResponse> getApproval(@PathVariable Long id) {
        ApprovalResponse response = approvalService.getApproval(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/number/{approvalNumber}")
    @Operation(summary = "승인 번호로 조회", description = "승인 번호로 상세 정보를 조회합니다.")
    public ResponseEntity<ApprovalResponse> getApprovalByNumber(@PathVariable String approvalNumber) {
        ApprovalResponse response = approvalService.getApprovalByNumber(approvalNumber);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "승인 목록 조회", description = "승인 목록을 검색 및 필터링하여 조회합니다.")
    public ResponseEntity<Page<ApprovalResponse>> searchApprovals(
            @RequestParam(required = false) ApprovalType approvalType,
            @RequestParam(required = false) ApprovalStatus status,
            @RequestParam(required = false) Long requesterId,
            @PageableDefault(size = 20, sort = "requestedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ApprovalResponse> response = approvalService.searchApprovals(
                approvalType, status, requesterId, pageable);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/my-pending")
    @Operation(summary = "내가 승인할 대기 건 목록", description = "현재 로그인 사용자가 승인할 대기 건 목록을 조회합니다.")
    public ResponseEntity<List<ApprovalResponse>> getMyPendingApprovals() {
        List<ApprovalResponse> response = approvalService.getMyPendingApprovals();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/my-requested")
    @Operation(summary = "내가 요청한 승인 목록", description = "현재 로그인 사용자가 요청한 승인 목록을 조회합니다.")
    public ResponseEntity<List<ApprovalResponse>> getMyRequestedApprovals() {
        List<ApprovalResponse> response = approvalService.getMyRequestedApprovals();
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/approve")
    @Operation(summary = "승인 처리", description = "승인을 처리합니다.")
    public ResponseEntity<ApprovalResponse> approve(
            @PathVariable Long id,
            @RequestBody ApprovalProcessRequest request) {
        ApprovalResponse response = approvalService.approve(id, request);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/reject")
    @Operation(summary = "반려 처리", description = "승인을 반려합니다.")
    public ResponseEntity<ApprovalResponse> reject(
            @PathVariable Long id,
            @RequestBody ApprovalProcessRequest request) {
        ApprovalResponse response = approvalService.reject(id, request);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/cancel")
    @Operation(summary = "승인 취소", description = "승인 요청을 취소합니다.")
    public ResponseEntity<ApprovalResponse> cancelApproval(@PathVariable Long id) {
        ApprovalResponse response = approvalService.cancelApproval(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/count/pending")
    @Operation(summary = "승인 대기 개수 조회", description = "사용자 권한에 따른 승인 대기 개수를 조회합니다.")
    public ResponseEntity<Long> countPendingApprovals() {
        long count = approvalService.countMyPendingApprovals();
        return ResponseEntity.ok(count);
    }
}









