package com.aris.domain.issue.service;

import com.aris.domain.issue.dto.IssueRequest;
import com.aris.domain.issue.dto.IssueResponse;
import com.aris.domain.issue.entity.Issue;
import com.aris.domain.issue.entity.IssueStatus;
import com.aris.domain.issue.entity.IssueType;
import com.aris.domain.issue.repository.IssueRepository;
import com.aris.domain.project.repository.ProjectRepository;
import com.aris.domain.spec.repository.SpecificationRepository;
import com.aris.domain.sr.repository.ServiceRequestRepository;
import com.aris.domain.user.entity.User;
import com.aris.domain.user.repository.UserRepository;
import com.aris.global.common.service.NumberingService;
import com.aris.global.exception.BusinessException;
import com.aris.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 이슈 관리 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class IssueService {
    
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final SpecificationRepository specificationRepository;
    private final ProjectRepository projectRepository;
    private final NumberingService numberingService;
    
    /**
     * 이슈 등록
     */
    @Transactional
    public IssueResponse createIssue(IssueRequest request) {
        // 자동 채번
        String issueNumber = numberingService.generateIssueNumber();
        
        // 보고자 조회: reporterId가 없으면 현재 로그인한 사용자 사용
        User reporter;
        if (request.reporterId() != null) {
            reporter = userRepository.findById(request.reporterId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        } else {
            reporter = getCurrentUser();
        }
        
        // 이슈 생성
        var issueBuilder = Issue.builder()
                .issueNumber(issueNumber)
                .title(request.title())
                .content(request.content())
                .issueType(request.issueType() != null ? request.issueType() : IssueType.BUG)
                .priority(request.priority() != null ? request.priority() : "MEDIUM")
                .reporter(reporter);
        
        // 프로젝트 연결
        if (request.projectId() != null) {
            var project = projectRepository.findById(request.projectId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
            issueBuilder.project(project);
        }
        
        // SR 연결
        if (request.srId() != null) {
            var sr = serviceRequestRepository.findById(request.srId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.SR_NOT_FOUND));
            issueBuilder.serviceRequest(sr);
        }
        
        // SPEC 연결
        if (request.specId() != null) {
            var spec = specificationRepository.findById(request.specId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.SPEC_NOT_FOUND));
            issueBuilder.specification(spec);
        }
        
        // 담당자 할당
        if (request.assigneeId() != null) {
            var assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
            issueBuilder.assignee(assignee);
        }
        
        // 부모 이슈 연결
        if (request.parentIssueId() != null) {
            var parentIssue = issueRepository.findById(request.parentIssueId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.ISSUE_NOT_FOUND));
            issueBuilder.parentIssue(parentIssue);
        }
        
        Issue issue = issueBuilder.build();
        Issue savedIssue = issueRepository.save(issue);
        
        log.info("이슈 생성 완료: {}", savedIssue.getIssueNumber());
        return IssueResponse.from(savedIssue);
    }
    
    /**
     * 이슈 조회
     */
    public IssueResponse getIssue(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ISSUE_NOT_FOUND));
        return IssueResponse.from(issue);
    }
    
    /**
     * 이슈 번호로 조회
     */
    public IssueResponse getIssueByNumber(String issueNumber) {
        Issue issue = issueRepository.findByIssueNumber(issueNumber)
                .orElseThrow(() -> new BusinessException(ErrorCode.ISSUE_NOT_FOUND));
        return IssueResponse.from(issue);
    }
    
    /**
     * 이슈 목록 조회
     */
    public Page<IssueResponse> getIssues(String title, IssueStatus status, Long reporterId, Long assigneeId, Pageable pageable) {
        return issueRepository.search(title, status, reporterId, assigneeId, pageable)
                .map(IssueResponse::from);
    }
    
    /**
     * 이슈 수정
     */
    @Transactional
    public IssueResponse updateIssue(Long id, IssueRequest request) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ISSUE_NOT_FOUND));
        
        // 담당자
        var assignee = request.assigneeId() != null
                ? userRepository.findById(request.assigneeId())
                        .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND))
                : null;
        
        issue.updateIssue(request.title(), request.content(), assignee);
        
        // issueType, priority 업데이트
        if (request.issueType() != null) {
            issue.updateIssueType(request.issueType());
        }
        if (request.priority() != null) {
            issue.updatePriority(request.priority());
        }
        
        log.info("이슈 수정 완료: {}", issue.getIssueNumber());
        return IssueResponse.from(issue);
    }
    
    /**
     * 이슈 상태 변경
     */
    @Transactional
    public IssueResponse updateIssueStatus(Long id, IssueStatus status) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ISSUE_NOT_FOUND));
        
        issue.updateStatus(status);
        
        log.info("이슈 상태 변경: {} -> {}", issue.getIssueNumber(), status);
        return IssueResponse.from(issue);
    }
    
    /**
     * 이슈 담당자 할당
     */
    @Transactional
    public IssueResponse assignIssue(Long id, Long assigneeId) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ISSUE_NOT_FOUND));
        
        var assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        
        issue.assignTo(assignee);
        
        log.info("이슈 담당자 할당: {} -> {}", issue.getIssueNumber(), assignee.getName());
        return IssueResponse.from(issue);
    }
    
    /**
     * 이슈 삭제 (Soft Delete)
     */
    @Transactional
    public void deleteIssue(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ISSUE_NOT_FOUND));
        
        issue.delete();
        
        log.info("이슈 삭제 완료: {}", issue.getIssueNumber());
    }
    
    /**
     * 현재 로그인한 사용자 조회
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
