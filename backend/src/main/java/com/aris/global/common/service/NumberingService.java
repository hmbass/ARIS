package com.aris.global.common.service;

import com.aris.domain.approval.repository.ApprovalRepository;
import com.aris.domain.asset.repository.AssetRepository;
import com.aris.domain.incident.repository.IncidentRepository;
import com.aris.domain.issue.repository.IssueRepository;
import com.aris.domain.partner.repository.PartnerRepository;
import com.aris.domain.release.repository.ReleaseRepository;
import com.aris.domain.sr.repository.ServiceRequestRepository;
import com.aris.domain.spec.repository.SpecificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 자동 채번 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NumberingService {
    
    private final ServiceRequestRepository serviceRequestRepository;
    private final SpecificationRepository specificationRepository;
    private final ApprovalRepository approvalRepository;
    private final IssueRepository issueRepository;
    private final ReleaseRepository releaseRepository;
    private final IncidentRepository incidentRepository;
    private final PartnerRepository partnerRepository;
    private final AssetRepository assetRepository;
    
    /**
     * SR 번호 자동 생성
     * 형식: SR{YY}{MM}-{####} (예: SR2501-0001)
     */
    public synchronized String generateSrNumber(LocalDate requestDate) {
        int year = requestDate.getYear() % 100;
        int month = requestDate.getMonthValue();
        String prefix = String.format("SR%02d%02d-", year, month);
        
        String maxNumber = serviceRequestRepository.findMaxSrNumberByPrefix(prefix);
        long sequence = 1;
        
        if (maxNumber != null && maxNumber.length() > prefix.length()) {
            try {
                sequence = Long.parseLong(maxNumber.substring(prefix.length())) + 1;
            } catch (NumberFormatException e) {
                // 파싱 실패 시 기존 count 방식 사용
                Long count = serviceRequestRepository.countByYearAndMonth(requestDate.getYear(), month);
                sequence = (count != null ? count : 0) + 1;
            }
        }
        
        return String.format("SR%02d%02d-%04d", year, month, sequence);
    }
    
    /**
     * SPEC 번호 자동 생성
     * 형식: SPEC{YY}{MM}-{####} (예: SPEC2501-0001)
     */
    public synchronized String generateSpecNumber() {
        LocalDateTime now = LocalDateTime.now();
        int year = now.getYear() % 100;
        int month = now.getMonthValue();
        String prefix = String.format("SPEC%02d%02d-", year, month);
        
        String maxNumber = specificationRepository.findMaxSpecNumberByPrefix(prefix);
        long sequence = 1;
        
        if (maxNumber != null && maxNumber.length() > prefix.length()) {
            try {
                sequence = Long.parseLong(maxNumber.substring(prefix.length())) + 1;
            } catch (NumberFormatException e) {
                Long count = specificationRepository.countByYearAndMonth(now.getYear(), month);
                sequence = (count != null ? count : 0) + 1;
            }
        }
        
        return String.format("SPEC%02d%02d-%04d", year, month, sequence);
    }
    
    /**
     * 승인 번호 자동 생성
     * 형식: APP{YY}{MM}-{####} (예: APP2501-0001)
     */
    public synchronized String generateApprovalNumber() {
        LocalDateTime now = LocalDateTime.now();
        int year = now.getYear() % 100;
        int month = now.getMonthValue();
        String prefix = String.format("APP%02d%02d-", year, month);
        
        String maxNumber = approvalRepository.findMaxApprovalNumberByPrefix(prefix);
        long sequence = 1;
        
        if (maxNumber != null && maxNumber.length() > prefix.length()) {
            try {
                sequence = Long.parseLong(maxNumber.substring(prefix.length())) + 1;
            } catch (NumberFormatException e) {
                Long count = approvalRepository.countByYearAndMonth(now.getYear(), month);
                sequence = (count != null ? count : 0) + 1;
            }
        }
        
        return String.format("APP%02d%02d-%04d", year, month, sequence);
    }
    
    /**
     * 이슈 번호 자동 생성
     * 형식: ISS{YY}{MM}-{####} (예: ISS2501-0001)
     */
    public synchronized String generateIssueNumber() {
        LocalDateTime now = LocalDateTime.now();
        int year = now.getYear() % 100;
        int month = now.getMonthValue();
        String prefix = String.format("ISS%02d%02d-", year, month);
        
        String maxNumber = issueRepository.findMaxIssueNumberByPrefix(prefix);
        long sequence = 1;
        
        if (maxNumber != null && maxNumber.length() > prefix.length()) {
            try {
                sequence = Long.parseLong(maxNumber.substring(prefix.length())) + 1;
            } catch (NumberFormatException e) {
                Long count = issueRepository.countByYearAndMonth(now.getYear(), month);
                sequence = (count != null ? count : 0) + 1;
            }
        }
        
        return String.format("ISS%02d%02d-%04d", year, month, sequence);
    }
    
    /**
     * 릴리즈 번호 자동 생성
     * 형식: REL{YY}{MM}-{####} (예: REL2501-0001)
     */
    public synchronized String generateReleaseNumber() {
        LocalDateTime now = LocalDateTime.now();
        int year = now.getYear() % 100;
        int month = now.getMonthValue();
        String prefix = String.format("REL%02d%02d-", year, month);
        
        String maxNumber = releaseRepository.findMaxReleaseNumberByPrefix(prefix);
        long sequence = 1;
        
        if (maxNumber != null && maxNumber.length() > prefix.length()) {
            try {
                sequence = Long.parseLong(maxNumber.substring(prefix.length())) + 1;
            } catch (NumberFormatException e) {
                Long count = releaseRepository.countByYearAndMonth(now.getYear(), month);
                sequence = (count != null ? count : 0) + 1;
            }
        }
        
        return String.format("REL%02d%02d-%04d", year, month, sequence);
    }
    
    /**
     * 장애 번호 자동 생성
     * 형식: INC{YY}{MM}-{####} (예: INC2501-0001)
     */
    public synchronized String generateIncidentNumber() {
        LocalDateTime now = LocalDateTime.now();
        int year = now.getYear() % 100;
        int month = now.getMonthValue();
        String prefix = String.format("INC%02d%02d-", year, month);
        
        String maxNumber = incidentRepository.findMaxIncidentNumberByPrefix(prefix);
        long sequence = 1;
        
        if (maxNumber != null && maxNumber.length() > prefix.length()) {
            try {
                sequence = Long.parseLong(maxNumber.substring(prefix.length())) + 1;
            } catch (NumberFormatException e) {
                Long count = incidentRepository.countByYearAndMonth(now.getYear(), month);
                sequence = (count != null ? count : 0) + 1;
            }
        }
        
        return String.format("INC%02d%02d-%04d", year, month, sequence);
    }
    
    /**
     * 파트너 코드 생성 (간단한 시퀀스)
     * 형식: PTR{####} (예: PTR0001)
     * Note: 파트너는 월별 리셋이 필요없으므로 전체 카운트 사용
     */
    public synchronized String generatePartnerCode() {
        Long count = partnerRepository.count();
        long sequence = (count != null ? count : 0) + 1;
        
        return String.format("PTR%04d", sequence);
    }
    
    /**
     * 자산 번호 생성 (간단한 시퀀스)
     * 형식: AST{####} (예: AST0001)
     * Note: 자산은 월별 리셋이 필요없으므로 전체 카운트 사용
     */
    public synchronized String generateAssetNumber() {
        Long count = assetRepository.count();
        long sequence = (count != null ? count : 0) + 1;
        
        return String.format("AST%04d", sequence);
    }
}

