package com.aris.domain.issue.controller;

import com.aris.domain.issue.dto.IssueRequest;
import com.aris.domain.issue.dto.IssueResponse;
import com.aris.domain.issue.entity.IssueStatus;
import com.aris.domain.issue.service.IssueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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

/**
 * 이슈 관리 Controller
 */
@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
@Tag(name = "Issue", description = "이슈 관리 API")
public class IssueController {
    
    private final IssueService issueService;
    
    @PostMapping
    @Operation(summary = "이슈 등록", description = "새로운 이슈를 등록합니다.")
    public ResponseEntity<IssueResponse> createIssue(@Valid @RequestBody IssueRequest request) {
        IssueResponse response = issueService.createIssue(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "이슈 조회", description = "이슈 ID로 상세 정보를 조회합니다.")
    public ResponseEntity<IssueResponse> getIssue(@PathVariable Long id) {
        IssueResponse response = issueService.getIssue(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/number/{issueNumber}")
    @Operation(summary = "이슈 번호로 조회", description = "이슈 번호로 상세 정보를 조회합니다.")
    public ResponseEntity<IssueResponse> getIssueByNumber(@PathVariable String issueNumber) {
        IssueResponse response = issueService.getIssueByNumber(issueNumber);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "이슈 목록 조회", description = "이슈 목록을 페이징하여 조회합니다.")
    public ResponseEntity<Page<IssueResponse>> getIssues(
            @Parameter(description = "이슈 제목") @RequestParam(required = false) String title,
            @Parameter(description = "이슈 상태") @RequestParam(required = false) IssueStatus status,
            @Parameter(description = "보고자 ID") @RequestParam(required = false) Long reporterId,
            @Parameter(description = "담당자 ID") @RequestParam(required = false) Long assigneeId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<IssueResponse> response = issueService.getIssues(title, status, reporterId, assigneeId, pageable);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "이슈 수정", description = "이슈 정보를 수정합니다.")
    public ResponseEntity<IssueResponse> updateIssue(
            @PathVariable Long id,
            @Valid @RequestBody IssueRequest request) {
        IssueResponse response = issueService.updateIssue(id, request);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/status")
    @Operation(summary = "이슈 상태 변경", description = "이슈의 상태를 변경합니다.")
    public ResponseEntity<IssueResponse> updateIssueStatus(
            @PathVariable Long id,
            @Parameter(description = "변경할 상태") @RequestParam IssueStatus status) {
        IssueResponse response = issueService.updateIssueStatus(id, status);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/assign")
    @Operation(summary = "이슈 담당자 할당", description = "이슈에 담당자를 할당합니다.")
    public ResponseEntity<IssueResponse> assignIssue(
            @PathVariable Long id,
            @Parameter(description = "담당자 ID") @RequestParam Long assigneeId) {
        IssueResponse response = issueService.assignIssue(id, assigneeId);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "이슈 삭제", description = "이슈를 삭제합니다 (Soft Delete).")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }
}









