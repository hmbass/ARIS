package com.aris.domain.project.service;

import com.aris.domain.company.entity.Company;
import com.aris.domain.company.repository.CompanyRepository;
import com.aris.domain.project.dto.ProjectRequest;
import com.aris.domain.project.dto.ProjectResponse;
import com.aris.domain.project.entity.Project;
import com.aris.domain.project.entity.ProjectStatus;
import com.aris.domain.project.entity.ProjectType;
import com.aris.domain.project.repository.ProjectRepository;
import com.aris.domain.user.entity.User;
import com.aris.domain.user.repository.UserRepository;
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
 * 프로젝트 Service
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {
    
    private final ProjectRepository projectRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    
    /**
     * 프로젝트 등록
     */
    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        // 프로젝트 코드 중복 확인
        if (projectRepository.existsByCode(request.getCode())) {
            throw new BusinessException(ErrorCode.DUPLICATE_PROJECT_CODE);
        }
        
        // 회사 조회: companyId가 없으면 현재 로그인한 사용자의 회사 사용
        Company company;
        if (request.getCompanyId() != null) {
            company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.COMPANY_NOT_FOUND));
        } else {
            // 현재 로그인한 사용자의 회사 조회
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
            
            if (currentUser.getCompany() == null) {
                throw new BusinessException(ErrorCode.COMPANY_NOT_FOUND);
            }
            company = currentUser.getCompany();
        }
        
        // PM 조회 (선택사항)
        User pm = null;
        if (request.getPmId() != null) {
            pm = userRepository.findById(request.getPmId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        }
        
        // 프로젝트 생성 (초기 상태는 PREPARING)
        Project project = Project.builder()
                .code(request.getCode())
                .name(request.getName())
                .projectType(request.getProjectType())
                .status(ProjectStatus.PREPARING)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .company(company)
                .description(request.getDescription())
                .budget(request.getBudget())
                .pm(pm)
                .build();
        
        Project savedProject = projectRepository.save(project);
        return ProjectResponse.from(savedProject);
    }
    
    /**
     * 프로젝트 조회
     */
    public ProjectResponse getProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
        return ProjectResponse.from(project);
    }
    
    /**
     * 프로젝트 목록 조회 (검색 및 필터링)
     * Admin은 모든 프로젝트 조회 가능, 일반 사용자는 본인 회사 프로젝트만 조회
     */
    public Page<ProjectResponse> searchProjects(String name, ProjectType projectType,
                                                 ProjectStatus status, Long companyId,
                                                 LocalDate startDate, LocalDate endDate,
                                                 Pageable pageable) {
        // Admin이 아닌 경우 본인 회사 프로젝트만 조회
        Long effectiveCompanyId = companyId;
        if (!isAdmin() && companyId == null) {
            User currentUser = getCurrentUser();
            if (currentUser.getCompany() != null) {
                effectiveCompanyId = currentUser.getCompany().getId();
            }
        }
        
        Page<Project> projects = projectRepository.search(
                name, projectType, status, effectiveCompanyId, startDate, endDate, pageable);
        return projects.map(ProjectResponse::from);
    }
    
    /**
     * 프로젝트 수정
     */
    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
        
        project.updateInfo(request.getName(), request.getDescription(),
                request.getEndDate(), request.getBudget());
        
        // PM 변경
        if (request.getPmId() != null) {
            User pm = userRepository.findById(request.getPmId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
            project.assignPm(pm);
        }
        
        return ProjectResponse.from(project);
    }
    
    /**
     * 프로젝트 상태 변경
     */
    @Transactional
    public ProjectResponse changeStatus(Long id, ProjectStatus status) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
        
        project.changeStatus(status);
        return ProjectResponse.from(project);
    }
    
    /**
     * 프로젝트 삭제 (Soft Delete)
     */
    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
        project.delete();
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

