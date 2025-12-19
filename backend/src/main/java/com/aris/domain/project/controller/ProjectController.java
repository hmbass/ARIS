package com.aris.domain.project.controller;

import com.aris.domain.project.dto.ProjectRequest;
import com.aris.domain.project.dto.ProjectResponse;
import com.aris.domain.project.entity.ProjectStatus;
import com.aris.domain.project.entity.ProjectType;
import com.aris.domain.project.service.ProjectService;
import com.aris.domain.user.dto.UserResponse;
import com.aris.domain.user.service.UserService;
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
 * 프로젝트 Controller
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Project", description = "프로젝트 관리 API")
public class ProjectController {
    
    private final ProjectService projectService;
    private final UserService userService;
    
    @PostMapping
    @Operation(summary = "프로젝트 등록", description = "새로운 프로젝트를 등록합니다.")
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody ProjectRequest request) {
        ProjectResponse response = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "프로젝트 조회", description = "프로젝트 상세 정보를 조회합니다.")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable Long id) {
        ProjectResponse response = projectService.getProject(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "프로젝트 목록 조회", description = "프로젝트 목록을 검색 및 필터링하여 조회합니다.")
    public ResponseEntity<Page<ProjectResponse>> searchProjects(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) ProjectType projectType,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ProjectResponse> response = projectService.searchProjects(
                name, projectType, status, companyId, startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "프로젝트 수정", description = "프로젝트 정보를 수정합니다.")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request) {
        ProjectResponse response = projectService.updateProject(id, request);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/status")
    @Operation(summary = "프로젝트 상태 변경", description = "프로젝트 상태를 변경합니다.")
    public ResponseEntity<ProjectResponse> changeStatus(
            @PathVariable Long id,
            @RequestParam ProjectStatus status) {
        ProjectResponse response = projectService.changeStatus(id, status);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "프로젝트 삭제", description = "프로젝트를 삭제합니다 (Soft Delete).")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/pm-candidates")
    @Operation(summary = "PM 후보 사용자 목록", description = "프로젝트 PM으로 지정할 수 있는 사용자 목록을 조회합니다.")
    public ResponseEntity<Page<UserResponse>> getPmCandidates(
            @PageableDefault(size = 100, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<UserResponse> response = userService.getActiveUsers(pageable);
        return ResponseEntity.ok(response);
    }
}









