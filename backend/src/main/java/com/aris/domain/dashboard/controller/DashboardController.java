package com.aris.domain.dashboard.controller;

import com.aris.domain.dashboard.dto.DashboardResponse;
import com.aris.domain.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 대시보드 컨트롤러
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "대시보드 API")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @Operation(summary = "대시보드 데이터 조회", description = "현재 로그인한 사용자 기준으로 대시보드 데이터를 조회합니다.")
    public ResponseEntity<DashboardResponse> getDashboard() {
        DashboardResponse response = dashboardService.getDashboardData();
        return ResponseEntity.ok(response);
    }
}


