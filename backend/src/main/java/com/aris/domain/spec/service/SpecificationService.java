package com.aris.domain.spec.service;

import com.aris.domain.spec.dto.SpecRequest;
import com.aris.domain.spec.dto.SpecResponse;
import com.aris.domain.spec.entity.Specification;
import com.aris.domain.spec.entity.SpecStatus;
import com.aris.domain.spec.entity.SpecType;
import com.aris.domain.spec.repository.SpecificationRepository;
import com.aris.domain.sr.entity.ServiceRequest;
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

import java.time.LocalDateTime;
import java.util.List;

/**
 * SPEC Service
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SpecificationService {
    
    private final SpecificationRepository specificationRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final UserRepository userRepository;
    private final NumberingService numberingService;
    
    /**
     * SPEC 등록
     */
    @Transactional
    public SpecResponse createSpecification(SpecRequest request) {
        // SR 조회 및 승인 여부 확인
        ServiceRequest sr = serviceRequestRepository.findById(request.getSrId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SR_NOT_FOUND));
        
        if (!sr.isApproved()) {
            throw new BusinessException(ErrorCode.SPEC_CANNOT_BE_CREATED);
        }
        
        // 담당자 조회 (선택사항)
        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        }
        
        // 검토자 조회 (선택사항)
        User reviewer = null;
        if (request.getReviewerId() != null) {
            reviewer = userRepository.findById(request.getReviewerId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        }
        
        // SPEC 번호 자동 생성
        String specNumber = numberingService.generateSpecNumber();
        
        // SPEC 생성
        Specification spec = Specification.builder()
                .specNumber(specNumber)
                .serviceRequest(sr)
                .specType(request.getSpecType())
                .specCategory(request.getSpecCategory())
                .status(SpecStatus.PENDING)
                .functionPoint(request.getFunctionPoint())
                .manDay(request.getManDay())
                .assignee(assignee)
                .reviewer(reviewer)
                .build();
        
        Specification savedSpec = specificationRepository.save(spec);
        
        // SR에 SPEC 연결
        sr.linkSpecification(savedSpec);
        
        return SpecResponse.from(savedSpec);
    }
    
    /**
     * SPEC 조회
     */
    public SpecResponse getSpecification(Long id) {
        Specification spec = specificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SPEC_NOT_FOUND));
        return SpecResponse.from(spec);
    }
    
    /**
     * SPEC 번호로 조회
     */
    public SpecResponse getSpecificationByNumber(String specNumber) {
        Specification spec = specificationRepository.findBySpecNumber(specNumber)
                .orElseThrow(() -> new BusinessException(ErrorCode.SPEC_NOT_FOUND));
        return SpecResponse.from(spec);
    }
    
    /**
     * SPEC 목록 조회 (검색 및 필터링)
     */
    public Page<SpecResponse> searchSpecifications(SpecType specType, SpecStatus status,
                                                    Long assigneeId, LocalDateTime startDate,
                                                    LocalDateTime endDate, Pageable pageable) {
        // 모든 필터가 null이면 기본 findAll 사용 (PostgreSQL Enum 타입 이슈 우회)
        if (specType == null && status == null && assigneeId == null && startDate == null && endDate == null) {
            Page<Specification> specs = specificationRepository.findAll(pageable);
            return specs.map(SpecResponse::from);
        }
        
        Page<Specification> specs = specificationRepository.search(
                specType, status, assigneeId, startDate, endDate, pageable);
        return specs.map(SpecResponse::from);
    }
    
    /**
     * SPEC 수정
     */
    @Transactional
    public SpecResponse updateSpecification(Long id, SpecRequest request) {
        Specification spec = specificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SPEC_NOT_FOUND));
        
        spec.updateInfo(request.getFunctionPoint(), request.getManDay());
        
        // 담당자/검토자 변경
        if (request.getAssigneeId() != null || request.getReviewerId() != null) {
            User assignee = request.getAssigneeId() != null
                    ? userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND))
                    : spec.getAssignee();
            
            User reviewer = request.getReviewerId() != null
                    ? userRepository.findById(request.getReviewerId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND))
                    : spec.getReviewer();
            
            spec.assignTo(assignee, reviewer);
        }
        
        return SpecResponse.from(spec);
    }
    
    /**
     * SPEC 작업 시작
     */
    @Transactional
    public SpecResponse startWork(Long id) {
        Specification spec = specificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SPEC_NOT_FOUND));
        
        spec.startWork();
        return SpecResponse.from(spec);
    }
    
    /**
     * SPEC 작업 완료
     */
    @Transactional
    public SpecResponse complete(Long id) {
        Specification spec = specificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SPEC_NOT_FOUND));
        
        spec.complete();
        return SpecResponse.from(spec);
    }
    
    /**
     * SPEC 상태 변경
     */
    @Transactional
    public SpecResponse changeStatus(Long id, SpecStatus status) {
        Specification spec = specificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SPEC_NOT_FOUND));
        
        spec.changeStatus(status);
        return SpecResponse.from(spec);
    }
    
    /**
     * SPEC 삭제 (Soft Delete)
     */
    @Transactional
    public void deleteSpecification(Long id) {
        Specification spec = specificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SPEC_NOT_FOUND));
        spec.delete();
    }
    
    /**
     * 승인 요청 가능한 SPEC 목록 조회 (진행중 상태만)
     * Admin은 모든 승인 대기 SPEC 조회, 일반 사용자는 본인 담당 SPEC만 조회
     */
    public List<SpecResponse> getApprovableSpecs() {
        List<Specification> specs;
        if (isAdmin()) {
            specs = specificationRepository.findApprovable();
        } else {
            User currentUser = getCurrentUser();
            specs = specificationRepository.findApprovableByAssigneeId(currentUser.getId());
        }
        return specs.stream().map(SpecResponse::from).toList();
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



