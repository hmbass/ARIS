package com.aris.domain.spec.controller;

import com.aris.domain.spec.dto.SpecRequest;
import com.aris.domain.spec.dto.SpecResponse;
import com.aris.domain.spec.entity.SpecStatus;
import com.aris.domain.spec.entity.SpecType;
import com.aris.domain.spec.service.SpecificationService;
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

import java.time.LocalDateTime;

/**
 * SPEC Controller
 */
@RestController
@RequestMapping("/api/specs")
@RequiredArgsConstructor
@Tag(name = "Specification", description = "SPEC 관리 API")
public class SpecificationController {
    
    private final SpecificationService specificationService;
    
    @PostMapping
    @Operation(summary = "SPEC 등록", description = "새로운 SPEC을 등록합니다.")
    public ResponseEntity<SpecResponse> createSpecification(
            @Valid @RequestBody SpecRequest request) {
        SpecResponse response = specificationService.createSpecification(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "SPEC 조회", description = "SPEC 상세 정보를 조회합니다.")
    public ResponseEntity<SpecResponse> getSpecification(@PathVariable Long id) {
        SpecResponse response = specificationService.getSpecification(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/number/{specNumber}")
    @Operation(summary = "SPEC 번호로 조회", description = "SPEC 번호로 상세 정보를 조회합니다.")
    public ResponseEntity<SpecResponse> getSpecificationByNumber(@PathVariable String specNumber) {
        SpecResponse response = specificationService.getSpecificationByNumber(specNumber);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "SPEC 목록 조회", description = "SPEC 목록을 검색 및 필터링하여 조회합니다.")
    public ResponseEntity<Page<SpecResponse>> searchSpecifications(
            @RequestParam(required = false) SpecType specType,
            @RequestParam(required = false) SpecStatus status,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<SpecResponse> response = specificationService.searchSpecifications(
                specType, status, assigneeId, startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "SPEC 수정", description = "SPEC 정보를 수정합니다.")
    public ResponseEntity<SpecResponse> updateSpecification(
            @PathVariable Long id,
            @Valid @RequestBody SpecRequest request) {
        SpecResponse response = specificationService.updateSpecification(id, request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/start")
    @Operation(summary = "SPEC 작업 시작", description = "SPEC 작업을 시작합니다.")
    public ResponseEntity<SpecResponse> startWork(@PathVariable Long id) {
        SpecResponse response = specificationService.startWork(id);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/complete")
    @Operation(summary = "SPEC 작업 완료", description = "SPEC 작업을 완료합니다.")
    public ResponseEntity<SpecResponse> complete(@PathVariable Long id) {
        SpecResponse response = specificationService.complete(id);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/status")
    @Operation(summary = "SPEC 상태 변경", description = "SPEC 상태를 변경합니다.")
    public ResponseEntity<SpecResponse> changeStatus(
            @PathVariable Long id,
            @RequestParam SpecStatus status) {
        SpecResponse response = specificationService.changeStatus(id, status);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "SPEC 삭제", description = "SPEC을 삭제합니다 (Soft Delete).")
    public ResponseEntity<Void> deleteSpecification(@PathVariable Long id) {
        specificationService.deleteSpecification(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/approvable")
    @Operation(summary = "승인 요청 가능한 SPEC 목록 조회", description = "승인 요청 가능한 SPEC 목록을 조회합니다.")
    public ResponseEntity<java.util.List<SpecResponse>> getApprovableSpecs() {
        java.util.List<SpecResponse> response = specificationService.getApprovableSpecs();
        return ResponseEntity.ok(response);
    }
}









