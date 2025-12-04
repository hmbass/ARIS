package com.aris.domain.partner.service;

import com.aris.domain.partner.dto.PartnerRequest;
import com.aris.domain.partner.dto.PartnerResponse;
import com.aris.domain.partner.entity.Partner;
import com.aris.domain.partner.repository.PartnerRepository;
import com.aris.domain.user.repository.UserRepository;
import com.aris.global.common.service.NumberingService;
import com.aris.global.exception.BusinessException;
import com.aris.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class PartnerService {
    
    private final PartnerRepository partnerRepository;
    private final UserRepository userRepository;
    private final NumberingService numberingService;
    
    @Transactional
    public PartnerResponse createPartner(PartnerRequest request) {
        // 사업자번호 중복 검증
        if (partnerRepository.existsByBusinessNumber(request.businessNumber())) {
            throw new BusinessException(ErrorCode.DUPLICATE_PARTNER_BUSINESS_NUMBER);
        }
        
        String partnerCode = numberingService.generatePartnerCode();
        
        var partnerBuilder = Partner.builder()
                .code(partnerCode)
                .name(request.name())
                .businessNumber(request.businessNumber())
                .ceoName(request.ceoName());
        
        if (request.managerId() != null) {
            var manager = userRepository.findById(request.managerId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
            partnerBuilder.manager(manager);
        }
        
        Partner partner = partnerBuilder.build();
        Partner savedPartner = partnerRepository.save(partner);
        
        log.info("파트너 생성 완료: {}", savedPartner.getCode());
        return PartnerResponse.from(savedPartner);
    }
    
    public PartnerResponse getPartner(Long id) {
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PARTNER_NOT_FOUND));
        return PartnerResponse.from(partner);
    }
    
    public PartnerResponse getPartnerByCode(String code) {
        Partner partner = partnerRepository.findByCode(code)
                .orElseThrow(() -> new BusinessException(ErrorCode.PARTNER_NOT_FOUND));
        return PartnerResponse.from(partner);
    }
    
    public Page<PartnerResponse> getPartners(String name, Boolean isClosed, Pageable pageable) {
        return partnerRepository.search(name, isClosed, pageable)
                .map(PartnerResponse::from);
    }
    
    @Transactional
    public PartnerResponse updatePartner(Long id, PartnerRequest request) {
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PARTNER_NOT_FOUND));
        
        var manager = request.managerId() != null
                ? userRepository.findById(request.managerId())
                        .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND))
                : null;
        
        partner.updatePartner(request.name(), request.ceoName(), manager);
        
        log.info("파트너 수정 완료: {}", partner.getCode());
        return PartnerResponse.from(partner);
    }
    
    @Transactional
    public PartnerResponse closePartner(Long id) {
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PARTNER_NOT_FOUND));
        
        partner.close();
        
        log.info("파트너 폐업 처리: {}", partner.getCode());
        return PartnerResponse.from(partner);
    }
    
    @Transactional
    public PartnerResponse reopenPartner(Long id) {
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PARTNER_NOT_FOUND));
        
        partner.reopen();
        
        log.info("파트너 재개업 처리: {}", partner.getCode());
        return PartnerResponse.from(partner);
    }
    
    @Transactional
    public void deletePartner(Long id) {
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PARTNER_NOT_FOUND));
        
        partner.delete();
        
        log.info("파트너 삭제 완료: {}", partner.getCode());
    }
}









