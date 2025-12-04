package com.aris.domain.approval.service;

import com.aris.domain.approval.dto.ApprovalProcessRequest;
import com.aris.domain.approval.dto.ApprovalRequest;
import com.aris.domain.approval.dto.ApprovalResponse;
import com.aris.domain.approval.entity.Approval;
import com.aris.domain.approval.entity.ApprovalLine;
import com.aris.domain.approval.entity.ApprovalLineStatus;
import com.aris.domain.approval.entity.ApprovalStatus;
import com.aris.domain.approval.entity.ApprovalType;
import com.aris.domain.approval.repository.ApprovalRepository;
import com.aris.domain.user.entity.User;
import com.aris.domain.user.repository.UserRepository;
import com.aris.global.common.service.NumberingService;
import com.aris.global.exception.BusinessException;
import com.aris.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 승인 Service
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalService {
    
    private final ApprovalRepository approvalRepository;
    private final UserRepository userRepository;
    private final NumberingService numberingService;
    
    /**
     * 승인 요청 생성
     */
    @Transactional
    public ApprovalResponse createApproval(ApprovalRequest request) {
        // 현재 로그인 사용자 (요청자)
        User requester = getCurrentUser();
        
        // 승인 번호 자동 생성
        String approvalNumber = numberingService.generateApprovalNumber();
        
        // 승인 생성
        Approval approval = Approval.builder()
                .approvalNumber(approvalNumber)
                .approvalType(request.getApprovalType())
                .targetId(request.getTargetId())
                .status(ApprovalStatus.PENDING)
                .currentStep(1)
                .totalSteps(request.getApproverIds().size())
                .requester(requester)
                .requestedAt(LocalDateTime.now())
                .build();
        
        // 승인라인 생성
        for (int i = 0; i < request.getApproverIds().size(); i++) {
            Long approverId = request.getApproverIds().get(i);
            User approver = userRepository.findById(approverId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
            
            ApprovalLine line = ApprovalLine.builder()
                    .approval(approval)
                    .stepOrder(i + 1)
                    .approver(approver)
                    .status(ApprovalLineStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .build();
            
            approval.addApprovalLine(line);
        }
        
        Approval savedApproval = approvalRepository.save(approval);
        return ApprovalResponse.from(savedApproval);
    }
    
    /**
     * 승인 처리
     */
    @Transactional
    public ApprovalResponse approve(Long id, ApprovalProcessRequest request) {
        Approval approval = approvalRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.APPROVAL_NOT_FOUND));
        
        User currentUser = getCurrentUser();
        approval.approve(currentUser.getId(), request.getComment());
        
        return ApprovalResponse.from(approval);
    }
    
    /**
     * 반려 처리
     */
    @Transactional
    public ApprovalResponse reject(Long id, ApprovalProcessRequest request) {
        Approval approval = approvalRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.APPROVAL_NOT_FOUND));
        
        User currentUser = getCurrentUser();
        approval.reject(currentUser.getId(), request.getComment());
        
        return ApprovalResponse.from(approval);
    }
    
    /**
     * 승인 취소
     */
    @Transactional
    public ApprovalResponse cancelApproval(Long id) {
        Approval approval = approvalRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.APPROVAL_NOT_FOUND));
        
        approval.cancel();
        return ApprovalResponse.from(approval);
    }
    
    /**
     * 승인 상세 조회
     */
    public ApprovalResponse getApproval(Long id) {
        Approval approval = approvalRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.APPROVAL_NOT_FOUND));
        return ApprovalResponse.from(approval);
    }
    
    /**
     * 승인 번호로 조회
     */
    public ApprovalResponse getApprovalByNumber(String approvalNumber) {
        Approval approval = approvalRepository.findByApprovalNumber(approvalNumber)
                .orElseThrow(() -> new BusinessException(ErrorCode.APPROVAL_NOT_FOUND));
        return ApprovalResponse.from(approval);
    }
    
    /**
     * 승인 목록 조회 (검색 및 필터링)
     */
    public Page<ApprovalResponse> searchApprovals(ApprovalType approvalType,
                                                   ApprovalStatus status,
                                                   Long requesterId,
                                                   Pageable pageable) {
        Page<Approval> approvals = approvalRepository.search(
                approvalType, status, requesterId, pageable);
        return approvals.map(ApprovalResponse::from);
    }
    
    /**
     * 내가 승인할 대기 건 목록 조회
     */
    public List<ApprovalResponse> getMyPendingApprovals() {
        User currentUser = getCurrentUser();
        List<Approval> approvals = approvalRepository.findPendingApprovalsByApproverId(currentUser.getId());
        return approvals.stream()
                .map(ApprovalResponse::from)
                .toList();
    }
    
    /**
     * 내가 요청한 승인 목록 조회
     */
    public List<ApprovalResponse> getMyRequestedApprovals() {
        User currentUser = getCurrentUser();
        List<Approval> approvals = approvalRepository.findByRequesterId(currentUser.getId());
        return approvals.stream()
                .map(ApprovalResponse::from)
                .toList();
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









