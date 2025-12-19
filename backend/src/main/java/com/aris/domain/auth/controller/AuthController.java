package com.aris.domain.auth.controller;

import com.aris.domain.auth.dto.LoginRequest;
import com.aris.domain.auth.dto.LoginResponse;
import com.aris.domain.auth.dto.RefreshTokenRequest;
import com.aris.domain.auth.dto.RefreshTokenResponse;
import com.aris.domain.auth.dto.ForgotPasswordRequest;
import com.aris.domain.auth.service.AuthService;
import com.aris.domain.user.dto.UserCreateRequest;
import com.aris.domain.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 Controller
 */
@Tag(name = "Authentication", description = "인증 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인합니다.")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserCreateRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "토큰 갱신", description = "리프레시 토큰으로 새로운 액세스 토큰을 발급받습니다.")
    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        RefreshTokenResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "비밀번호 찾기", description = "이메일로 임시 비밀번호를 발급합니다.")
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String tempPassword = authService.forgotPassword(request);
        // 개발 환경에서만 임시 비밀번호 반환 (운영 환경에서는 제거 필요)
        return ResponseEntity.ok("임시 비밀번호가 발급되었습니다: " + tempPassword);
    }

    @Operation(summary = "로그아웃", description = "로그아웃 처리합니다. (JWT 기반이므로 클라이언트 측 토큰 삭제 필요)")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // JWT는 stateless이므로 서버 측에서 특별한 처리가 필요 없음
        // 클라이언트에서 토큰을 삭제하면 로그아웃 완료
        // 필요시 여기서 토큰 블랙리스트 처리 가능
        return ResponseEntity.ok().build();
    }
}







