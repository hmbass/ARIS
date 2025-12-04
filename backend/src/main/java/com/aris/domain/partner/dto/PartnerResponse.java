package com.aris.domain.partner.dto;

import com.aris.domain.partner.entity.Partner;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
public record PartnerResponse(
        Long id,
        String code,
        String name,
        String businessNumber,
        String ceoName,
        Boolean isClosed,
        LocalDate closedAt,
        Long managerId,
        String managerName,
        LocalDateTime createdAt,
        String createdBy,
        LocalDateTime updatedAt,
        String updatedBy
) {
    public static PartnerResponse from(Partner partner) {
        return PartnerResponse.builder()
                .id(partner.getId())
                .code(partner.getCode())
                .name(partner.getName())
                .businessNumber(partner.getBusinessNumber())
                .ceoName(partner.getCeoName())
                .isClosed(partner.getIsClosed())
                .closedAt(partner.getClosedAt())
                .managerId(partner.getManager() != null ? partner.getManager().getId() : null)
                .managerName(partner.getManager() != null ? partner.getManager().getName() : null)
                .createdAt(partner.getCreatedAt())
                .createdBy(partner.getCreatedBy())
                .updatedAt(partner.getUpdatedAt())
                .updatedBy(partner.getUpdatedBy())
                .build();
    }
}









