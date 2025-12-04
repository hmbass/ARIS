package com.aris.domain.user.service;

import com.aris.domain.company.entity.Company;
import com.aris.domain.company.entity.Department;
import com.aris.domain.company.repository.CompanyRepository;
import com.aris.domain.company.repository.DepartmentRepository;
import com.aris.domain.user.dto.PasswordResetRequest;
import com.aris.domain.user.dto.UserCreateRequest;
import com.aris.domain.user.dto.UserResponse;
import com.aris.domain.user.dto.UserUpdateRequest;
import com.aris.domain.user.entity.User;
import com.aris.domain.user.repository.UserRepository;
import com.aris.global.exception.BusinessException;
import com.aris.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 사용자 관리 Service
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * 사용자 목록 조회
     */
    public Page<UserResponse> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(UserResponse::from);
    }
    
    /**
     * 사용자 상세 조회
     */
    public UserResponse getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return UserResponse.from(user);
    }
    
    /**
     * 사용자 생성
     */
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        // 이메일 중복 확인
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }
        
        // 회사 조회
        Company company = null;
        if (request.getCompanyId() != null) {
            company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.COMPANY_NOT_FOUND));
        }
        
        // 부서 조회
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND));
        }
        
        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        
        // 사용자 생성
        User user = User.builder()
                .email(request.getEmail())
                .password(encodedPassword)
                .name(request.getName())
                .phoneNumber(request.getPhoneNumber())
                .company(company)
                .department(department)
                .employeeNumber(request.getEmployeeNumber())
                .position(request.getPosition())
                .isActive(true)
                .isApproved(true)
                .isLocked(false)
                .build();
        
        // 신규 사용자는 초기 비밀번호 변경 필요
        user.requirePasswordChange();
        
        User savedUser = userRepository.save(user);
        log.info("사용자 생성 완료: {}", savedUser.getEmail());
        
        return UserResponse.from(savedUser);
    }
    
    /**
     * 사용자 정보 수정
     */
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        
        // 부서 조회
        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND));
            user.updateDepartment(department);
        }
        
        // 정보 수정
        if (request.getName() != null) {
            user.updateName(request.getName());
        }
        if (request.getPhoneNumber() != null) {
            user.updatePhoneNumber(request.getPhoneNumber());
        }
        if (request.getPosition() != null) {
            user.updatePosition(request.getPosition());
        }
        
        log.info("사용자 정보 수정 완료: {}", user.getEmail());
        
        return UserResponse.from(user);
    }
    
    /**
     * 비밀번호 재설정
     */
    @Transactional
    public void resetPassword(Long id, PasswordResetRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        
        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        user.changePassword(encodedPassword);
        
        log.info("비밀번호 재설정 완료: {}", user.getEmail());
    }
    
    /**
     * 사용자 삭제 (Soft Delete)
     */
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        
        user.delete();
        
        log.info("사용자 삭제 완료: {}", user.getEmail());
    }
    
    /**
     * 사용자 활성화/비활성화
     */
    @Transactional
    public void toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        
        user.toggleActive();
        
        log.info("사용자 상태 변경 완료: {} - {}", user.getEmail(), user.getIsActive() ? "활성화" : "비활성화");
    }
}

