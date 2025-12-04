package com.aris.domain.partner.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record PartnerRequest(
        @NotBlank(message = "파트너명은 필수입니다.")
        @Size(max = 100, message = "파트너명은 100자를 초과할 수 없습니다.")
        String name,
        
        @NotBlank(message = "사업자등록번호는 필수입니다.")
        @Pattern(regexp = "^\\d{10,12}$", message = "사업자등록번호는 10-12자리 숫자여야 합니다.")
        String businessNumber,
        
        @Size(max = 50, message = "대표자명은 50자를 초과할 수 없습니다.")
        String ceoName,
        
        Long managerId
) {}









