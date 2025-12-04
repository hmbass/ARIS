package com.aris.domain.auth.service;

import com.aris.domain.auth.dto.LoginRequest;
import com.aris.domain.auth.dto.LoginResponse;
import com.aris.domain.auth.dto.RefreshTokenResponse;
import com.aris.domain.auth.dto.ForgotPasswordRequest;
import com.aris.domain.auth.dto.ResetPasswordRequest;
import com.aris.domain.user.dto.UserCreateRequest;
import com.aris.domain.user.dto.UserResponse;
import com.aris.domain.user.entity.User;
import com.aris.domain.user.repository.UserRepository;
import com.aris.domain.company.entity.Company;
import com.aris.domain.company.entity.Department;
import com.aris.domain.company.repository.CompanyRepository;
import com.aris.domain.company.repository.DepartmentRepository;
import com.aris.domain.role.entity.Role;
import com.aris.domain.role.repository.RoleRepository;
import com.aris.global.exception.BusinessException;
import com.aris.global.exception.ErrorCode;
import com.aris.global.security.CustomUserDetails;
import com.aris.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 인증 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 로그인
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        try {
            // 인증 시도
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.getUser();

            // 계정 상태 체크
            if (!user.getIsActive()) {
                throw new BusinessException(ErrorCode.USER_NOT_ACTIVE);
            }
            if (!user.getIsApproved()) {
                throw new BusinessException(ErrorCode.USER_NOT_APPROVED);
            }
            if (user.getIsLocked()) {
                throw new BusinessException(ErrorCode.USER_LOCKED);
            }

            // 로그인 성공 처리
            user.loginSuccess();
            userRepository.save(user);

            // 토큰 생성
            Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
            String accessToken = jwtTokenProvider.createAccessToken(user.getEmail(), authorities);
            String refreshToken = jwtTokenProvider.createRefreshToken(user.getEmail());

            log.info("사용자 로그인 성공: {}", user.getEmail());

            return LoginResponse.of(
                    accessToken,
                    refreshToken,
                    jwtTokenProvider.getAccessTokenValidity(),
                    UserResponse.from(user)
            );
        } catch (Exception e) {
            log.error("로그인 실패: {}", request.getEmail(), e);
            
            // 로그인 실패 카운트 증가
            userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
                user.loginFailed();
                userRepository.save(user);
            });
            
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
    }

    /**
     * 회원가입
     */
    @Transactional
    public UserResponse register(UserCreateRequest request) {
        // 이메일 중복 체크
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }

        // Company 조회 (companyId가 없으면 첫 번째 회사 사용)
        Company company;
        if (request.getCompanyId() != null) {
            company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.COMPANY_NOT_FOUND));
        } else {
            company = companyRepository.findAll().stream()
                    .findFirst()
                    .orElseThrow(() -> new BusinessException(ErrorCode.COMPANY_NOT_FOUND));
        }

        // Department 조회 (선택사항)
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND));
        }

        // 기본 역할(ROLE_USER) 조회
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND));

        // 사용자 생성 (회원가입 시 자동 승인)
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phoneNumber(request.getPhoneNumber())
                .company(company)
                .department(department)
                .employeeNumber(request.getEmployeeNumber())
                .position(request.getPosition())
                .isActive(true)
                .isApproved(true)  // 회원가입 시 자동 승인
                .isLocked(false)
                .build();

        // 기본 역할 할당
        user.assignRole(userRole);

        User savedUser = userRepository.save(user);
        log.info("신규 사용자 등록 (자동 승인, 기본 역할 할당): {}", savedUser.getEmail());

        return UserResponse.from(savedUser);
    }

    /**
     * 토큰 갱신
     */
    @Transactional
    public RefreshTokenResponse refreshToken(String refreshToken) {
        try {
            // 리프레시 토큰 검증
            if (!jwtTokenProvider.validateToken(refreshToken)) {
                throw new BusinessException(ErrorCode.INVALID_TOKEN);
            }

            // 리프레시 토큰에서 이메일 추출
            String email = jwtTokenProvider.getEmailFromToken(refreshToken);

            // 사용자 조회
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

            // 계정 상태 체크
            if (!user.getIsActive()) {
                throw new BusinessException(ErrorCode.USER_NOT_ACTIVE);
            }
            if (!user.getIsApproved()) {
                throw new BusinessException(ErrorCode.USER_NOT_APPROVED);
            }
            if (user.getIsLocked()) {
                throw new BusinessException(ErrorCode.USER_LOCKED);
            }

            // 새로운 토큰 생성
            Collection<GrantedAuthority> authorities = user.getRoles().stream()
                    .map(role -> (GrantedAuthority) () -> role.getName())
                    .collect(Collectors.toList());

            String newAccessToken = jwtTokenProvider.createAccessToken(user.getEmail(), authorities);
            String newRefreshToken = jwtTokenProvider.createRefreshToken(user.getEmail());

            log.info("토큰 갱신 성공: {}", user.getEmail());

            return RefreshTokenResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .build();
        } catch (Exception e) {
            log.error("토큰 갱신 실패", e);
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }
    }

    /**
     * 비밀번호 찾기 (임시 비밀번호 발급)
     * 실제 운영 환경에서는 이메일로 임시 비밀번호를 전송해야 합니다.
     */
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 임시 비밀번호 생성 (8자리 랜덤)
        String tempPassword = UUID.randomUUID().toString().substring(0, 8);
        
        // 비밀번호 변경 및 초기 비밀번호 변경 필수 설정
        user.changePassword(passwordEncoder.encode(tempPassword));
        user.requirePasswordChange();
        userRepository.save(user);

        log.info("임시 비밀번호 발급: {}", user.getEmail());

        // TODO: 실제 운영 환경에서는 이메일로 임시 비밀번호 전송
        // emailService.sendTempPassword(user.getEmail(), tempPassword);

        // 개발 환경에서는 임시 비밀번호 반환 (운영 환경에서는 제거 필요)
        return tempPassword;
    }

    /**
     * 비밀번호 재설정 (토큰 기반)
     * 향후 이메일 인증 토큰 기반으로 개선 가능
     */
    @Transactional
    public void resetPasswordWithToken(ResetPasswordRequest request) {
        // TODO: 토큰 검증 로직 추가
        // 현재는 간단한 구현으로 이메일 기반 처리
        
        log.info("비밀번호 재설정 완료");
    }
}







