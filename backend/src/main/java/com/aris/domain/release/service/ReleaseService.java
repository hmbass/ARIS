package com.aris.domain.release.service;

import com.aris.domain.company.repository.DepartmentRepository;
import com.aris.domain.release.dto.ReleaseRequest;
import com.aris.domain.release.dto.ReleaseResponse;
import com.aris.domain.release.dto.ReleaseUpdateRequest;
import com.aris.domain.release.entity.Release;
import com.aris.domain.release.entity.ReleaseStatus;
import com.aris.domain.release.entity.ReleaseType;
import com.aris.domain.release.repository.ReleaseRepository;
import com.aris.domain.user.entity.User;
import com.aris.domain.user.repository.UserRepository;
import com.aris.global.common.service.NumberingService;
import com.aris.global.exception.BusinessException;
import com.aris.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 릴리즈 관리 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ReleaseService {
    
    private final ReleaseRepository releaseRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final NumberingService numberingService;
    
    /**
     * 릴리즈 등록
     */
    @Transactional
    public ReleaseResponse createRelease(ReleaseRequest request) {
        // 자동 채번
        String releaseNumber = numberingService.generateReleaseNumber();
        
        // 요청자 조회 (requesterId가 null이면 현재 로그인 사용자 사용)
        User requester;
        if (request.requesterId() != null) {
            requester = userRepository.findById(request.requesterId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        } else {
            requester = getCurrentUser();
        }
        
        // 릴리즈 생성
        var releaseBuilder = Release.builder()
                .releaseNumber(releaseNumber)
                .title(request.title())
                .releaseType(request.releaseType())
                .content(request.content())
                .requester(requester)
                .scheduledAt(request.scheduledAt());
        
        // 요청부서
        if (request.requesterDeptId() != null) {
            var dept = departmentRepository.findById(request.requesterDeptId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND));
            releaseBuilder.requesterDept(dept);
        }
        
        Release release = releaseBuilder.build();
        Release savedRelease = releaseRepository.save(release);
        
        log.info("릴리즈 생성 완료: {}", savedRelease.getReleaseNumber());
        return ReleaseResponse.from(savedRelease);
    }
    
    /**
     * 릴리즈 조회
     */
    public ReleaseResponse getRelease(Long id) {
        Release release = releaseRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RELEASE_NOT_FOUND));
        return ReleaseResponse.from(release);
    }
    
    /**
     * 릴리즈 번호로 조회
     */
    public ReleaseResponse getReleaseByNumber(String releaseNumber) {
        Release release = releaseRepository.findByReleaseNumber(releaseNumber)
                .orElseThrow(() -> new BusinessException(ErrorCode.RELEASE_NOT_FOUND));
        return ReleaseResponse.from(release);
    }
    
    /**
     * 릴리즈 목록 조회
     */
    public Page<ReleaseResponse> getReleases(String title, ReleaseType releaseType, ReleaseStatus status, Long requesterId, Pageable pageable) {
        return releaseRepository.search(title, releaseType, status, requesterId, pageable)
                .map(ReleaseResponse::from);
    }
    
    /**
     * 승인 가능한 릴리즈 목록 조회
     */
    public List<ReleaseResponse> getApprovableReleases() {
        return releaseRepository.findApprovableReleases().stream()
                .map(ReleaseResponse::from)
                .toList();
    }
    
    /**
     * 릴리즈 수정
     */
    @Transactional
    public ReleaseResponse updateRelease(Long id, ReleaseUpdateRequest request) {
        Release release = releaseRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RELEASE_NOT_FOUND));
        
        release.updateRelease(request.title(), request.content(), request.scheduledAt());
        
        log.info("릴리즈 수정 완료: {}", release.getReleaseNumber());
        return ReleaseResponse.from(release);
    }
    
    /**
     * 릴리즈 승인
     */
    @Transactional
    public ReleaseResponse approveRelease(Long id, Long approverId) {
        Release release = releaseRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RELEASE_NOT_FOUND));
        
        var approver = userRepository.findById(approverId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        
        release.approve(approver);
        
        log.info("릴리즈 승인 완료: {} by {}", release.getReleaseNumber(), approver.getName());
        return ReleaseResponse.from(release);
    }
    
    /**
     * 릴리즈 배포
     */
    @Transactional
    public ReleaseResponse deployRelease(Long id) {
        Release release = releaseRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RELEASE_NOT_FOUND));
        
        if (release.getStatus() != ReleaseStatus.APPROVED) {
            throw new BusinessException(ErrorCode.INVALID_RELEASE_STATUS);
        }
        
        release.deploy();
        
        log.info("릴리즈 배포 완료: {}", release.getReleaseNumber());
        return ReleaseResponse.from(release);
    }
    
    /**
     * 릴리즈 취소
     */
    @Transactional
    public ReleaseResponse cancelRelease(Long id) {
        Release release = releaseRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RELEASE_NOT_FOUND));
        
        release.cancel();
        
        log.info("릴리즈 취소 완료: {}", release.getReleaseNumber());
        return ReleaseResponse.from(release);
    }
    
    /**
     * 릴리즈 삭제 (Soft Delete)
     */
    @Transactional
    public void deleteRelease(Long id) {
        Release release = releaseRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RELEASE_NOT_FOUND));
        
        release.delete();
        
        log.info("릴리즈 삭제 완료: {}", release.getReleaseNumber());
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
}









