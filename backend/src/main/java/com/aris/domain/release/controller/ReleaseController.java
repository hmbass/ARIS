package com.aris.domain.release.controller;

import com.aris.domain.release.dto.ReleaseRequest;
import com.aris.domain.release.dto.ReleaseResponse;
import com.aris.domain.release.dto.ReleaseUpdateRequest;
import com.aris.domain.release.entity.ReleaseStatus;
import com.aris.domain.release.entity.ReleaseType;
import com.aris.domain.release.service.ReleaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 릴리즈 관리 Controller
 */
@RestController
@RequestMapping("/api/releases")
@RequiredArgsConstructor
@Tag(name = "Release", description = "릴리즈 관리 API")
public class ReleaseController {
    
    private final ReleaseService releaseService;
    
    @PostMapping
    @Operation(summary = "릴리즈 등록", description = "새로운 릴리즈를 등록합니다.")
    public ResponseEntity<ReleaseResponse> createRelease(@Valid @RequestBody ReleaseRequest request) {
        ReleaseResponse response = releaseService.createRelease(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "릴리즈 조회", description = "릴리즈 ID로 상세 정보를 조회합니다.")
    public ResponseEntity<ReleaseResponse> getRelease(@PathVariable Long id) {
        ReleaseResponse response = releaseService.getRelease(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/number/{releaseNumber}")
    @Operation(summary = "릴리즈 번호로 조회", description = "릴리즈 번호로 상세 정보를 조회합니다.")
    public ResponseEntity<ReleaseResponse> getReleaseByNumber(@PathVariable String releaseNumber) {
        ReleaseResponse response = releaseService.getReleaseByNumber(releaseNumber);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "릴리즈 목록 조회", description = "릴리즈 목록을 페이징하여 조회합니다.")
    public ResponseEntity<Page<ReleaseResponse>> getReleases(
            @Parameter(description = "릴리즈 제목") @RequestParam(required = false) String title,
            @Parameter(description = "릴리즈 유형") @RequestParam(required = false) ReleaseType releaseType,
            @Parameter(description = "릴리즈 상태") @RequestParam(required = false) ReleaseStatus status,
            @Parameter(description = "요청자 ID") @RequestParam(required = false) Long requesterId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ReleaseResponse> response = releaseService.getReleases(title, releaseType, status, requesterId, pageable);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/approvable")
    @Operation(summary = "승인 가능한 릴리즈 목록 조회", description = "승인 요청 가능한 릴리즈 목록을 조회합니다 (요청됨 상태).")
    public ResponseEntity<List<ReleaseResponse>> getApprovableReleases() {
        List<ReleaseResponse> response = releaseService.getApprovableReleases();
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "릴리즈 수정", description = "릴리즈 정보를 수정합니다.")
    public ResponseEntity<ReleaseResponse> updateRelease(
            @PathVariable Long id,
            @Valid @RequestBody ReleaseUpdateRequest request) {
        ReleaseResponse response = releaseService.updateRelease(id, request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/approve")
    @Operation(summary = "릴리즈 승인", description = "릴리즈를 승인합니다.")
    public ResponseEntity<ReleaseResponse> approveRelease(
            @PathVariable Long id,
            @Parameter(description = "승인자 ID") @RequestParam Long approverId) {
        ReleaseResponse response = releaseService.approveRelease(id, approverId);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/deploy")
    @Operation(summary = "릴리즈 배포", description = "승인된 릴리즈를 배포합니다.")
    public ResponseEntity<ReleaseResponse> deployRelease(@PathVariable Long id) {
        ReleaseResponse response = releaseService.deployRelease(id);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/cancel")
    @Operation(summary = "릴리즈 취소", description = "릴리즈를 취소합니다.")
    public ResponseEntity<ReleaseResponse> cancelRelease(@PathVariable Long id) {
        ReleaseResponse response = releaseService.cancelRelease(id);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "릴리즈 삭제", description = "릴리즈를 삭제합니다 (Soft Delete).")
    public ResponseEntity<Void> deleteRelease(@PathVariable Long id) {
        releaseService.deleteRelease(id);
        return ResponseEntity.noContent().build();
    }
}









