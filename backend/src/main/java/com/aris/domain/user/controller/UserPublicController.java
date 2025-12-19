package com.aris.domain.user.controller;

import com.aris.domain.user.dto.UserSimpleResponse;
import com.aris.domain.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 사용자 공개 API Controller
 * 
 * 인증된 모든 사용자가 접근 가능 (담당자 선택 등)
 */
@Tag(name = "User Public", description = "사용자 공개 API (담당자 선택용)")
@RestController
@RequestMapping("/api/users-simple")
@RequiredArgsConstructor
public class UserPublicController {
    
    private final UserService userService;
    
    @Operation(
        summary = "활성화된 사용자 간소화 목록 조회",
        description = "담당자 선택을 위한 활성화된 사용자 간소화 목록을 조회합니다. (ID, 이름, 이메일, 부서명만 포함)"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping
    public ResponseEntity<Page<UserSimpleResponse>> getActiveUsersSimple(
            @PageableDefault(size = 100, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<UserSimpleResponse> users = userService.getActiveUsersSimple(pageable);
        return ResponseEntity.ok(users);
    }
}


