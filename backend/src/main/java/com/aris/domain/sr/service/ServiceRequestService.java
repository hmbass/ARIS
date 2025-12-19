package com.aris.domain.sr.service;

import com.aris.domain.company.entity.Department;
import com.aris.domain.company.repository.DepartmentRepository;
import com.aris.domain.project.entity.Project;
import com.aris.domain.project.repository.ProjectRepository;
import com.aris.domain.sr.dto.SrCreateRequest;
import com.aris.domain.sr.dto.SrResponse;
import com.aris.domain.sr.dto.SrUpdateRequest;
import com.aris.domain.sr.entity.ServiceRequest;
import com.aris.domain.sr.entity.SrStatus;
import com.aris.domain.sr.entity.SrType;
import com.aris.domain.sr.repository.ServiceRequestRepository;
import com.aris.domain.user.entity.User;
import com.aris.domain.user.repository.UserRepository;
import com.aris.global.common.service.NumberingService;
import com.aris.global.exception.BusinessException;
import com.aris.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * SR Service
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ServiceRequestService {
    
    private final ServiceRequestRepository serviceRequestRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final NumberingService numberingService;
    
    /**
     * SR 등록
     */
    @Transactional
    public SrResponse createServiceRequest(SrCreateRequest request) {
        // 프로젝트 조회
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
        
        // 현재 로그인 사용자 (요청자)
        User requester = getCurrentUser();
        
        // 요청부서 조회 (선택사항)
        Department requesterDept = null;
        if (request.getRequesterDeptId() != null) {
            requesterDept = departmentRepository.findById(request.getRequesterDeptId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND));
        }
        
        // requestDate가 없으면 오늘 날짜 사용
        LocalDate requestDate = request.getRequestDate() != null 
                ? request.getRequestDate() 
                : LocalDate.now();
        
        // SR 번호 자동 생성
        String srNumber = numberingService.generateSrNumber(requestDate);
        
        // SR 생성
        ServiceRequest sr = ServiceRequest.builder()
                .srNumber(srNumber)
                .title(request.getTitle())
                .srType(request.getSrType())
                .srCategory(request.getSrCategory())
                .status(SrStatus.APPROVAL_REQUESTED)
                .businessRequirement(request.getBusinessRequirement())
                .project(project)
                .requester(requester)
                .requesterDept(requesterDept)
                .requestDate(requestDate)
                .dueDate(request.getDueDate())
                .priority(request.getPriority() != null ? request.getPriority() : "MEDIUM")
                .build();
        
        ServiceRequest savedSr = serviceRequestRepository.save(sr);
        return SrResponse.from(savedSr);
    }
    
    /**
     * SR 상세 조회
     */
    public SrResponse getServiceRequest(Long id) {
        ServiceRequest sr = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SR_NOT_FOUND));
        return SrResponse.from(sr);
    }
    
    /**
     * SR 번호로 조회
     */
    public SrResponse getServiceRequestByNumber(String srNumber) {
        ServiceRequest sr = serviceRequestRepository.findBySrNumber(srNumber)
                .orElseThrow(() -> new BusinessException(ErrorCode.SR_NOT_FOUND));
        return SrResponse.from(sr);
    }
    
    /**
     * SR 목록 조회 (검색 및 필터링)
     * Admin은 모든 SR 조회 가능, 일반 사용자는 본인이 등록한 SR만 조회
     */
    public Page<SrResponse> searchServiceRequests(String title, SrType srType,
                                                   SrStatus status, Long projectId,
                                                   Long requesterId, LocalDate startDate,
                                                   LocalDate endDate, Pageable pageable) {
        // Admin이 아닌 경우 본인 SR만 조회
        Long effectiveRequesterId = requesterId;
        if (!isAdmin()) {
            User currentUser = getCurrentUser();
            effectiveRequesterId = currentUser.getId();
        }
        
        Page<ServiceRequest> srs = serviceRequestRepository.search(
                title, srType, status, projectId, effectiveRequesterId, startDate, endDate, pageable);
        return srs.map(SrResponse::from);
    }
    
    /**
     * 현재 사용자의 SR 개수 조회 (Sidebar badge용)
     */
    public long countUserServiceRequests() {
        if (isAdmin()) {
            return serviceRequestRepository.countByDeletedAtIsNull();
        }
        User currentUser = getCurrentUser();
        return serviceRequestRepository.countByRequesterIdAndDeletedAtIsNull(currentUser.getId());
    }
    
    /**
     * SR 수정
     */
    @Transactional
    public SrResponse updateServiceRequest(Long id, SrUpdateRequest request) {
        ServiceRequest sr = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SR_NOT_FOUND));
        
        sr.updateInfo(request.getTitle(), request.getBusinessRequirement(),
                request.getDueDate(), request.getPriority());
        
        return SrResponse.from(sr);
    }
    
    /**
     * SR 상태 변경
     */
    @Transactional
    public SrResponse changeStatus(Long id, SrStatus status) {
        ServiceRequest sr = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SR_NOT_FOUND));
        
        sr.changeStatus(status);
        return SrResponse.from(sr);
    }
    
    /**
     * SR 삭제 (Soft Delete)
     */
    @Transactional
    public void deleteServiceRequest(Long id) {
        ServiceRequest sr = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SR_NOT_FOUND));
        sr.delete();
    }
    
    /**
     * 승인 요청 가능한 SR 목록 조회 (승인요청/반려 상태만)
     * Admin은 모든 승인 대기 SR 조회, 일반 사용자는 본인 SR만 조회
     */
    public java.util.List<SrResponse> getApprovableSrs() {
        java.util.List<ServiceRequest> srs;
        if (isAdmin()) {
            srs = serviceRequestRepository.findApprovable();
        } else {
            User currentUser = getCurrentUser();
            srs = serviceRequestRepository.findApprovableByRequesterId(currentUser.getId());
        }
        return srs.stream().map(SrResponse::from).toList();
    }
    
    /**
     * 현재 로그인 사용자 조회
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
    
    /**
     * 현재 사용자가 Admin 권한인지 확인
     */
    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ROLE_SYSTEM_ADMIN"));
    }
}





